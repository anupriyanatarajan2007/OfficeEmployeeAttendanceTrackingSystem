package com.example.demo.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.AttendanceLog;

@Repository
public interface AttendanceLogRepository extends JpaRepository<AttendanceLog, Long> {
    List<AttendanceLog> findByEmployeeCodeOrderByTimestampDesc(String employeeCode);
    Page<AttendanceLog> findByEmployeeCodeOrderByTimestampDesc(String employeeCode, Pageable pageable);
    List<AttendanceLog> findByDate(LocalDate date);
}
