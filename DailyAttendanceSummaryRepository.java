package com.example.demo.repository;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.DailyAttendanceSummary;

@Repository
public interface DailyAttendanceSummaryRepository extends JpaRepository<DailyAttendanceSummary, Long> {
    Page<DailyAttendanceSummary> findByEmployeeCode(String employeeCode, Pageable pageable);

    Page<DailyAttendanceSummary> findByEmployeeCodeAndDateBetween(
        String employeeCode, LocalDate startDate, LocalDate endDate, Pageable pageable);
}
