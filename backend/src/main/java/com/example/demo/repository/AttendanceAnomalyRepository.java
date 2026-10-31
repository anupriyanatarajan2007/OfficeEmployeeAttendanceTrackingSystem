package com.example.demo.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.AnomalySeverity;
import com.example.demo.model.AttendanceAnomaly;

@Repository
public interface AttendanceAnomalyRepository extends JpaRepository<AttendanceAnomaly, Long> {
    List<AttendanceAnomaly> findByResolvedFalseOrderByDetectedAtDesc();
    Page<AttendanceAnomaly> findByResolvedFalseOrderByDetectedAtDesc(Pageable pageable);
    Page<AttendanceAnomaly> findAllByOrderByDetectedAtDesc(Pageable pageable);
    List<AttendanceAnomaly> findBySeverityAndResolvedFalse(AnomalySeverity severity);
    long countByResolvedFalse();
}
