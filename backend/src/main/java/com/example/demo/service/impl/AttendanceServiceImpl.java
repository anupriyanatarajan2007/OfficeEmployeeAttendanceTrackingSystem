package com.example.demo.service.impl;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.AttendanceCheckInRequest;
import com.example.demo.dto.AttendanceCheckOutRequest;
import com.example.demo.dto.AttendanceResponseDto;
import com.example.demo.dto.DashboardStatsDto;
import com.example.demo.exception.InvalidAttendanceOperationException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.AttendanceLog;
import com.example.demo.model.AttendanceRecord;
import com.example.demo.model.AttendanceStatus;
import com.example.demo.model.DailyAttendanceSummary;
import com.example.demo.model.Department;
import com.example.demo.model.Employee;
import com.example.demo.model.EmployeeStatus;
import com.example.demo.model.LeaveStatus;
import com.example.demo.model.NotificationType;
import com.example.demo.model.Shift;
import com.example.demo.repository.AttendanceAnomalyRepository;
import com.example.demo.repository.AttendanceLogRepository;
import com.example.demo.repository.AttendanceRecordRepository;
import com.example.demo.repository.DailyAttendanceSummaryRepository;
import com.example.demo.repository.DepartmentRepository;
import com.example.demo.repository.EmployeeRepository;
import com.example.demo.repository.LeaveRequestRepository;
import com.example.demo.service.AttendanceService;
import com.example.demo.service.AttendanceVerificationService;
import com.example.demo.service.AuditLogService;
import com.example.demo.service.NotificationService;
import com.example.demo.service.ShiftCalculationService;
import com.example.demo.service.ShiftCalculationService.ShiftComputationResult;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    private final EmployeeRepository employeeRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceLogRepository attendanceLogRepository;
    private final DailyAttendanceSummaryRepository dailySummaryRepository;
    private final DepartmentRepository departmentRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final AttendanceAnomalyRepository anomalyRepository;
    private final AttendanceVerificationService verificationService;
    private final ShiftCalculationService shiftCalculationService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public AttendanceServiceImpl(EmployeeRepository employeeRepository,
                                 AttendanceRecordRepository attendanceRecordRepository,
                                 AttendanceLogRepository attendanceLogRepository,
                                 DailyAttendanceSummaryRepository dailySummaryRepository,
                                 DepartmentRepository departmentRepository,
                                 LeaveRequestRepository leaveRequestRepository,
                                 AttendanceAnomalyRepository anomalyRepository,
                                 AttendanceVerificationService verificationService,
                                 ShiftCalculationService shiftCalculationService,
                                 NotificationService notificationService,
                                 AuditLogService auditLogService) {
        this.employeeRepository = employeeRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.attendanceLogRepository = attendanceLogRepository;
        this.dailySummaryRepository = dailySummaryRepository;
        this.departmentRepository = departmentRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.anomalyRepository = anomalyRepository;
        this.verificationService = verificationService;
        this.shiftCalculationService = shiftCalculationService;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    private Employee getEmployeeByPrincipal(String username) {
        return employeeRepository.findByUserUsername(username)
                .or(() -> employeeRepository.findOptionalByEmpCode(username))
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for user: " + username));
    }

    @Override
    @Transactional
    public AttendanceResponseDto checkIn(String username, AttendanceCheckInRequest request) {
        Employee employee = getEmployeeByPrincipal(username);

        // Run multi-factor verification pipeline
        AttendanceVerificationService.VerificationEngineResult result = verificationService.verifyMultiFactor(
                employee,
                "CHECK_IN",
                request.getLatitude(),
                request.getLongitude(),
                request.getFaceData(),
                request.getQrToken(),
                request.getDeviceInfo(),
                request.getIpAddress()
        );

        LocalDate today = LocalDate.now();
        LocalTime nowTime = LocalTime.now();

        Shift shift = employee.getAssignedShift();
        int lateMinutes = shiftCalculationService.calculateLateMinutes(shift, nowTime);

        AttendanceRecord record = new AttendanceRecord();
        record.setEmployee(employee);
        record.setEmployeeCode(employee.getEmpCode());
        record.setDate(today);
        record.setCheckInTime(nowTime);
        record.setLateMinutes(lateMinutes);
        record.setShiftName(shift != null ? shift.getShiftName() : "General Shift");
        record.setLocationVerified(result.isLocationVerified());
        record.setFaceVerified(result.isFaceVerified());
        record.setQrVerified(result.isQrVerified());

        if (lateMinutes > 0) {
            record.setStatus(AttendanceStatus.LATE.name());
        } else {
            record.setStatus(AttendanceStatus.PRESENT.name());
        }

        AttendanceRecord savedRecord = attendanceRecordRepository.save(record);

        // Attendance Event Log
        AttendanceLog log = new AttendanceLog(
                employee.getEmpCode(),
                "CHECK_IN_SUCCESS",
                "SUCCESS",
                String.format("Check-in successful at %02d:%02d%s",
                        nowTime.getHour(), nowTime.getMinute(),
                        lateMinutes > 0 ? " (" + lateMinutes + " mins late)" : "")
        );
        log.setCheckInTime(nowTime);
        attendanceLogRepository.save(log);

        // Update Daily Summary
        updateDailySummaryOnCheckIn(employee.getEmpCode(), today, lateMinutes > 0);

        // Send Notification
        if (employee.getUser() != null) {
            String title = lateMinutes > 0 ? "Late Arrival Notice" : "Check-in Successful";
            String msg = lateMinutes > 0
                    ? String.format("You checked in at %02d:%02d (%d minutes late for your shift).", nowTime.getHour(), nowTime.getMinute(), lateMinutes)
                    : String.format("You checked in on time at %02d:%02d. Have a productive day!", nowTime.getHour(), nowTime.getMinute());
            NotificationType type = lateMinutes > 0 ? NotificationType.WARNING : NotificationType.SUCCESS;
            notificationService.sendNotification(employee.getUser(), title, msg, type);
        }

        // Audit Log
        auditLogService.logAction(username, "CHECK_IN", "AttendanceRecord", savedRecord.getId().toString(),
                "Employee " + employee.getEmpCode() + " checked in successfully", request.getIpAddress());

        return AttendanceResponseDto.fromEntity(savedRecord);
    }

    @Override
    @Transactional
    public AttendanceResponseDto checkOut(String username, AttendanceCheckOutRequest request) {
        Employee employee = getEmployeeByPrincipal(username);

        // Run multi-factor verification pipeline
        AttendanceVerificationService.VerificationEngineResult result = verificationService.verifyMultiFactor(
                employee,
                "CHECK_OUT",
                request.getLatitude(),
                request.getLongitude(),
                request.getFaceData(),
                request.getQrToken(),
                request.getDeviceInfo(),
                request.getIpAddress()
        );

        LocalDate today = LocalDate.now();
        LocalTime nowTime = LocalTime.now();

        AttendanceRecord record = attendanceRecordRepository.findByEmployeeCodeAndDate(employee.getEmpCode(), today)
                .orElseThrow(() -> new InvalidAttendanceOperationException("No check-in record found for today"));

        Shift shift = employee.getAssignedShift();
        ShiftComputationResult metrics = shiftCalculationService.computeFullShiftMetrics(
                shift, record.getCheckInTime(), nowTime);

        record.setCheckOutTime(nowTime);
        record.setWorkingMinutes(metrics.getWorkingMinutes());
        record.setEarlyCheckoutMinutes(metrics.getEarlyCheckoutMinutes());
        record.setOvertimeMinutes(metrics.getOvertimeMinutes());

        if (metrics.getEarlyCheckoutMinutes() >= 30 && !record.getStatus().equals(AttendanceStatus.LATE.name())) {
            record.setStatus(AttendanceStatus.EARLY_CHECKOUT.name());
        } else if (metrics.getOvertimeMinutes() >= 30) {
            record.setStatus(AttendanceStatus.OVERTIME.name());
        }

        AttendanceRecord savedRecord = attendanceRecordRepository.save(record);

        // Attendance Event Log
        int hours = metrics.getWorkingMinutes() / 60;
        int mins = metrics.getWorkingMinutes() % 60;
        AttendanceLog log = new AttendanceLog(
                employee.getEmpCode(),
                "CHECK_OUT_SUCCESS",
                "SUCCESS",
                String.format("Check-out successful at %02d:%02d. Total duration: %dh %dm",
                        nowTime.getHour(), nowTime.getMinute(), hours, mins)
        );
        log.setCheckOutTime(nowTime);
        attendanceLogRepository.save(log);

        // Update Daily Summary
        updateDailySummaryOnCheckOut(employee.getEmpCode(), today, metrics.getWorkingMinutes(), metrics.getOvertimeMinutes());

        // Send Notification
        if (employee.getUser() != null) {
            String msg = String.format("You checked out at %02d:%02d. Total working time: %dh %dm (Overtime: %dm).",
                    nowTime.getHour(), nowTime.getMinute(), hours, mins, metrics.getOvertimeMinutes());
            notificationService.sendNotification(employee.getUser(), "Check-out Recorded", msg, NotificationType.INFO);
        }

        // Audit Log
        auditLogService.logAction(username, "CHECK_OUT", "AttendanceRecord", savedRecord.getId().toString(),
                "Employee " + employee.getEmpCode() + " checked out. Worked: " + hours + "h " + mins + "m", request.getIpAddress());

        return AttendanceResponseDto.fromEntity(savedRecord);
    }

    @Override
    public Page<AttendanceResponseDto> getMyAttendance(String username, Pageable pageable) {
        Employee employee = getEmployeeByPrincipal(username);
        return attendanceRecordRepository.findByEmployeeCodeOrderByDateDesc(employee.getEmpCode(), pageable)
                .map(AttendanceResponseDto::fromEntity);
    }

    @Override
    public Optional<AttendanceResponseDto> getTodayAttendance(String username) {
        Employee employee = getEmployeeByPrincipal(username);
        return attendanceRecordRepository.findByEmployeeCodeAndDate(employee.getEmpCode(), LocalDate.now())
                .map(AttendanceResponseDto::fromEntity);
    }

    @Override
    public Page<AttendanceResponseDto> searchAttendance(LocalDate date, String employeeCode, String status, Pageable pageable) {
        return attendanceRecordRepository.searchAttendance(date, employeeCode, status, pageable)
                .map(AttendanceResponseDto::fromEntity);
    }

    @Override
    public AttendanceRecord getRecordById(Long id) {
        return attendanceRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found with id: " + id));
    }

    @Override
    public DashboardStatsDto getDashboardStats() {
        LocalDate today = LocalDate.now();
        DashboardStatsDto stats = new DashboardStatsDto();

        long total = employeeRepository.count();
        long active = employeeRepository.countByStatus(EmployeeStatus.ACTIVE);
        long present = attendanceRecordRepository.countByDateAndStatus(today, AttendanceStatus.PRESENT.name()) +
                       attendanceRecordRepository.countByDateAndStatus(today, AttendanceStatus.OVERTIME.name()) +
                       attendanceRecordRepository.countByDateAndStatus(today, AttendanceStatus.EARLY_CHECKOUT.name());
        long late = attendanceRecordRepository.countLateArrivalsByDate(today);
        long absent = attendanceRecordRepository.countByDateAndStatus(today, AttendanceStatus.ABSENT.name());
        long onLeave = leaveRequestRepository.countByStatus(LeaveStatus.APPROVED);
        long suspicious = anomalyRepository.countByResolvedFalse();

        double attendancePct = active > 0 ? (double) (present + late) / active * 100.0 : 0.0;
        attendancePct = Math.round(attendancePct * 10.0) / 10.0;

        stats.setTotalEmployees(total);
        stats.setActiveEmployees(active);
        stats.setPresentToday(present);
        stats.setAbsentToday(absent);
        stats.setLateToday(late);
        stats.setOnLeaveToday(onLeave);
        stats.setAttendancePercentage(attendancePct);
        stats.setSuspiciousAttemptsCount(suspicious);

        // Department-wise attendance breakdown
        List<Map<String, Object>> deptStats = new ArrayList<>();
        List<Department> departments = departmentRepository.findByActiveTrue();
        for (Department dept : departments) {
            List<Employee> emps = employeeRepository.findByDepartmentRefId(dept.getId());
            long deptPresent = 0;
            for (Employee emp : emps) {
                if (attendanceRecordRepository.findByEmployeeCodeAndDate(emp.getEmpCode(), today).isPresent()) {
                    deptPresent++;
                }
            }
            Map<String, Object> map = new HashMap<>();
            map.put("department", dept.getDepartmentName());
            map.put("total", emps.size());
            map.put("present", deptPresent);
            deptStats.add(map);
        }
        stats.setDepartmentAttendance(deptStats);

        // Weekly attendance (Last 7 days)
        List<Map<String, Object>> weekly = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            long p = attendanceRecordRepository.countByDateAndStatus(d, AttendanceStatus.PRESENT.name()) +
                     attendanceRecordRepository.countByDateAndStatus(d, AttendanceStatus.LATE.name());
            long a = attendanceRecordRepository.countByDateAndStatus(d, AttendanceStatus.ABSENT.name());
            Map<String, Object> dayMap = new HashMap<>();
            dayMap.put("date", d.getDayOfWeek().name().substring(0, 3));
            dayMap.put("present", p);
            dayMap.put("absent", a);
            weekly.add(dayMap);
        }
        stats.setWeeklyAttendance(weekly);

        return stats;
    }

    private void updateDailySummaryOnCheckIn(String employeeCode, LocalDate date, boolean isLate) {
        DailyAttendanceSummary summary = dailySummaryRepository.findByEmployeeCodeAndDate(employeeCode, date)
                .orElseGet(() -> new DailyAttendanceSummary(employeeCode, date));

        summary.setPresentDays(1);
        if (isLate) {
            summary.setLateDays(1);
        }
        dailySummaryRepository.save(summary);
    }

    private void updateDailySummaryOnCheckOut(String employeeCode, LocalDate date, int workingMinutes, int overtimeMinutes) {
        dailySummaryRepository.findByEmployeeCodeAndDate(employeeCode, date).ifPresent(summary -> {
            summary.setTotalWorkingMinutes(workingMinutes);
            summary.setTotalOvertimeMinutes(overtimeMinutes);
            dailySummaryRepository.save(summary);
        });
    }
}
