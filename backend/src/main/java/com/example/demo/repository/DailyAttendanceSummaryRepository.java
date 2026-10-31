package com.example.demo.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.DailyAttendanceSummary;

@Repository
public interface DailyAttendanceSummaryRepository extends JpaRepository<DailyAttendanceSummary, Long> {

    // Preserved exact signatures from original repository
    Page<DailyAttendanceSummary> findByEmployeeCode(String employeeCode, Pageable pageable);

    Page<DailyAttendanceSummary> findByEmployeeCodeAndDateBetween(
        String employeeCode, LocalDate startDate, LocalDate endDate, Pageable pageable);

    Optional<DailyAttendanceSummary> findByEmployeeCodeAndDate(String employeeCode, LocalDate date);

    List<DailyAttendanceSummary> findByDate(LocalDate date);
}
