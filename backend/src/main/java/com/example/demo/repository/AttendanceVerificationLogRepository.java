package com.example.demo.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.AttendanceVerificationLog;

@Repository
public interface AttendanceVerificationLogRepository extends JpaRepository<AttendanceVerificationLog, Long> {
    List<AttendanceVerificationLog> findByEmployeeCodeOrderByCreatedAtDesc(String employeeCode);
    Page<AttendanceVerificationLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
    long countByEmployeeCodeAndVerificationResultAndCreatedAtAfter(String employeeCode, String result, java.time.LocalDateTime after);
}
