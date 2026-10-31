package com.example.demo.service;

import java.time.LocalDate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.LocationVerificationRequest;
import com.example.demo.dto.LocationVerificationResponse;
import com.example.demo.exception.DuplicateAttendanceException;
import com.example.demo.exception.FaceVerificationException;
import com.example.demo.exception.InvalidAttendanceOperationException;
import com.example.demo.exception.InvalidQrException;
import com.example.demo.exception.LocationVerificationException;
import com.example.demo.model.AnomalySeverity;
import com.example.demo.model.AttendanceRecord;
import com.example.demo.model.AttendanceStatus;
import com.example.demo.model.AttendanceVerificationLog;
import com.example.demo.model.Employee;
import com.example.demo.model.EmployeeStatus;
import com.example.demo.repository.AttendanceRecordRepository;
import com.example.demo.repository.AttendanceVerificationLogRepository;

@Service
public class AttendanceVerificationService {

    private static final Logger logger = LoggerFactory.getLogger(AttendanceVerificationService.class);

    private final LocationVerificationService locationService;
    private final FaceVerificationService faceService;
    private final DynamicQrService qrService;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceVerificationLogRepository verificationLogRepository;
    private final AnomalyDetectionService anomalyService;

    public AttendanceVerificationService(LocationVerificationService locationService,
                                         FaceVerificationService faceService,
                                         DynamicQrService qrService,
                                         AttendanceRecordRepository attendanceRecordRepository,
                                         AttendanceVerificationLogRepository verificationLogRepository,
                                         AnomalyDetectionService anomalyService) {
        this.locationService = locationService;
        this.faceService = faceService;
        this.qrService = qrService;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.verificationLogRepository = verificationLogRepository;
        this.anomalyService = anomalyService;
    }

    public static class VerificationEngineResult {
        private boolean accepted;
        private String failureReason;
        private double distanceFromOffice;
        private boolean locationVerified;
        private boolean faceVerified;
        private boolean qrVerified;
        private boolean shiftVerified;

        public VerificationEngineResult(boolean accepted, String failureReason, double distanceFromOffice,
                                        boolean locationVerified, boolean faceVerified, boolean qrVerified, boolean shiftVerified) {
            this.accepted = accepted;
            this.failureReason = failureReason;
            this.distanceFromOffice = distanceFromOffice;
            this.locationVerified = locationVerified;
            this.faceVerified = faceVerified;
            this.qrVerified = qrVerified;
            this.shiftVerified = shiftVerified;
        }

        public boolean isAccepted() { return accepted; }
        public String getFailureReason() { return failureReason; }
        public double getDistanceFromOffice() { return distanceFromOffice; }
        public boolean isLocationVerified() { return locationVerified; }
        public boolean isFaceVerified() { return faceVerified; }
        public boolean isQrVerified() { return qrVerified; }
        public boolean isShiftVerified() { return shiftVerified; }
    }

    /**
     * Executes the comprehensive multi-factor attendance verification pipeline.
     */
    @Transactional
    public VerificationEngineResult verifyMultiFactor(
            Employee employee,
            String attendanceType, // CHECK_IN or CHECK_OUT
            Double latitude,
            Double longitude,
            String faceData,
            String qrToken,
            String deviceInfo,
            String ipAddress) {

        boolean locationOk = false;
        boolean faceOk = false;
        boolean qrOk = false;
        boolean shiftOk = true;
        double distanceMeters = 0.0;
        String failureReason = null;

        // 1. Employee status validation
        if (employee.getStatus() != EmployeeStatus.ACTIVE) {
            failureReason = "Employee account is not active (Status: " + employee.getStatus() + ")";
            logVerification(employee.getEmpCode(), attendanceType, false, false, false, false, "REJECTED", failureReason, latitude, longitude, distanceMeters, deviceInfo, ipAddress);
            anomalyService.recordAnomaly(employee, null, "INACTIVE_EMPLOYEE_ATTEMPT", failureReason, AnomalySeverity.MEDIUM);
            throw new InvalidAttendanceOperationException(failureReason);
        }

        LocalDate today = LocalDate.now();

        // 2. Attendance Rule Checks
        if ("CHECK_IN".equalsIgnoreCase(attendanceType)) {
            // Duplicate Check-In check
            if (attendanceRecordRepository.findByEmployeeCodeAndDate(employee.getEmpCode(), today).isPresent()) {
                failureReason = "Employee has already checked in today (" + today + ")";
                logVerification(employee.getEmpCode(), attendanceType, false, false, false, false, "REJECTED", failureReason, latitude, longitude, distanceMeters, deviceInfo, ipAddress);
                anomalyService.recordAnomaly(employee, null, "DUPLICATE_CHECKIN_ATTEMPT", failureReason, AnomalySeverity.LOW);
                throw new DuplicateAttendanceException(failureReason);
            }
        } else if ("CHECK_OUT".equalsIgnoreCase(attendanceType)) {
            // Must have existing check-in today
            AttendanceRecord record = attendanceRecordRepository.findByEmployeeCodeAndDate(employee.getEmpCode(), today)
                    .orElse(null);
            if (record == null || record.getCheckInTime() == null) {
                failureReason = "Cannot check out without an active check-in record for today (" + today + ")";
                logVerification(employee.getEmpCode(), attendanceType, false, false, false, false, "REJECTED", failureReason, latitude, longitude, distanceMeters, deviceInfo, ipAddress);
                throw new InvalidAttendanceOperationException(failureReason);
            }
            if (record.getCheckOutTime() != null) {
                failureReason = "Employee has already checked out today at " + record.getCheckOutTime();
                logVerification(employee.getEmpCode(), attendanceType, false, false, false, false, "REJECTED", failureReason, latitude, longitude, distanceMeters, deviceInfo, ipAddress);
                throw new InvalidAttendanceOperationException(failureReason);
            }
        }

        // 3. Location Verification
        try {
            LocationVerificationResponse locResp = locationService.verifyLocation(new LocationVerificationRequest(latitude, longitude));
            distanceMeters = locResp.getDistanceFromOfficeMeters();
            if (!locResp.isVerified()) {
                failureReason = locResp.getMessage();
                logVerification(employee.getEmpCode(), attendanceType, false, false, false, shiftOk, "REJECTED", failureReason, latitude, longitude, distanceMeters, deviceInfo, ipAddress);
                anomalyService.recordAnomaly(employee, null, "GEOFENCE_BREACH", failureReason, distanceMeters > 500 ? AnomalySeverity.HIGH : AnomalySeverity.MEDIUM);
                throw new LocationVerificationException(failureReason);
            }
            locationOk = true;
        } catch (LocationVerificationException e) {
            throw e;
        } catch (Exception e) {
            failureReason = "Location verification error: " + e.getMessage();
            logVerification(employee.getEmpCode(), attendanceType, false, false, false, shiftOk, "REJECTED", failureReason, latitude, longitude, distanceMeters, deviceInfo, ipAddress);
            throw new LocationVerificationException(failureReason);
        }

        // 4. Face Biometric Verification
        try {
            faceService.validateFaceOrThrow(employee.getEmpCode(), faceData);
            faceOk = true;
        } catch (FaceVerificationException e) {
            failureReason = e.getMessage();
            logVerification(employee.getEmpCode(), attendanceType, false, locationOk, false, shiftOk, "REJECTED", failureReason, latitude, longitude, distanceMeters, deviceInfo, ipAddress);
            anomalyService.recordAnomaly(employee, null, "FACE_VERIFICATION_FAILED", failureReason, AnomalySeverity.HIGH);
            throw e;
        }

        // 5. Dynamic QR Verification
        try {
            qrService.validateQrOrThrow(qrToken);
            qrOk = true;
        } catch (InvalidQrException e) {
            failureReason = e.getMessage();
            logVerification(employee.getEmpCode(), attendanceType, faceOk, locationOk, false, shiftOk, "REJECTED", failureReason, latitude, longitude, distanceMeters, deviceInfo, ipAddress);
            anomalyService.recordAnomaly(employee, null, "QR_VERIFICATION_FAILED", failureReason, AnomalySeverity.HIGH);
            throw e;
        }

        // All verified!
        logVerification(employee.getEmpCode(), attendanceType, faceOk, locationOk, qrOk, shiftOk, "ACCEPTED", null, latitude, longitude, distanceMeters, deviceInfo, ipAddress);

        return new VerificationEngineResult(true, null, distanceMeters, locationOk, faceOk, qrOk, shiftOk);
    }

    private void logVerification(String empCode, String type, boolean face, boolean loc, boolean qr, boolean shift,
                                 String result, String reason, Double lat, Double lon, Double dist, String dev, String ip) {
        AttendanceVerificationLog log = new AttendanceVerificationLog();
        log.setEmployeeCode(empCode);
        log.setAttendanceType(type);
        log.setFaceVerified(face);
        log.setLocationVerified(loc);
        log.setQrVerified(qr);
        log.setShiftVerified(shift);
        log.setVerificationResult(result);
        log.setFailureReason(reason);
        log.setLatitude(lat);
        log.setLongitude(lon);
        log.setDistanceFromOffice(dist);
        log.setDeviceInfo(dev);
        log.setIpAddress(ip);

        verificationLogRepository.save(log);
    }
}
