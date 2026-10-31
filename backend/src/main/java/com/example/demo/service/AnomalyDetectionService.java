package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.AnomalySeverity;
import com.example.demo.model.AttendanceAnomaly;
import com.example.demo.model.AttendanceRecord;
import com.example.demo.model.Employee;
import com.example.demo.repository.AttendanceAnomalyRepository;

@Service
public class AnomalyDetectionService {

    private static final Logger logger = LoggerFactory.getLogger(AnomalyDetectionService.class);

    private final AttendanceAnomalyRepository anomalyRepository;

    public AnomalyDetectionService(AttendanceAnomalyRepository anomalyRepository) {
        this.anomalyRepository = anomalyRepository;
    }

    @Transactional
    public AttendanceAnomaly recordAnomaly(Employee employee, AttendanceRecord record,
                                          String anomalyType, String description, AnomalySeverity severity) {
        AttendanceAnomaly anomaly = new AttendanceAnomaly(employee, anomalyType, description, severity);
        anomaly.setAttendanceRecord(record);
        AttendanceAnomaly saved = anomalyRepository.save(anomaly);
        logger.warn("Attendance Anomaly Detected [{}]: {} - Employee: {}",
                severity, description, employee != null ? employee.getEmpCode() : "UNKNOWN");
        return saved;
    }

    public List<AttendanceAnomaly> getUnresolvedAnomalies() {
        return anomalyRepository.findByResolvedFalseOrderByDetectedAtDesc();
    }

    public Page<AttendanceAnomaly> getAllAnomalies(Pageable pageable) {
        return anomalyRepository.findAllByOrderByDetectedAtDesc(pageable);
    }

    @Transactional
    public AttendanceAnomaly resolveAnomaly(Long id, String resolutionNote) {
        AttendanceAnomaly anomaly = anomalyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Anomaly not found with id: " + id));

        anomaly.setResolved(true);
        anomaly.setResolvedAt(LocalDateTime.now());
        anomaly.setResolutionNote(resolutionNote != null ? resolutionNote : "Resolved by administrator");

        return anomalyRepository.save(anomaly);
    }

    public long getUnresolvedCount() {
        return anomalyRepository.countByResolvedFalse();
    }
}
