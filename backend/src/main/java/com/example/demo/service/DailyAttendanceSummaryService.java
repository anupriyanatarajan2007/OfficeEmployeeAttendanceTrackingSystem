package com.example.demo.service;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.demo.model.DailyAttendanceSummary;

public interface DailyAttendanceSummaryService {
    DailyAttendanceSummary create(DailyAttendanceSummary summary);
    Page<DailyAttendanceSummary> getByEmployeeCodeAndDateRange(
            String empCode, LocalDate start, LocalDate end, Pageable pageable);
    Page<DailyAttendanceSummary> getByEmployeeId(Long employeeId, Pageable pageable);
}
