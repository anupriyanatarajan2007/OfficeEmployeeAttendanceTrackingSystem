package com.example.demo.service;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.demo.dto.AttendanceCheckInRequest;
import com.example.demo.dto.AttendanceCheckOutRequest;
import com.example.demo.dto.AttendanceResponseDto;
import com.example.demo.dto.DashboardStatsDto;
import com.example.demo.model.AttendanceRecord;

public interface AttendanceService {
    AttendanceResponseDto checkIn(String username, AttendanceCheckInRequest request);
    AttendanceResponseDto checkOut(String username, AttendanceCheckOutRequest request);
    Page<AttendanceResponseDto> getMyAttendance(String username, Pageable pageable);
    Optional<AttendanceResponseDto> getTodayAttendance(String username);
    Page<AttendanceResponseDto> searchAttendance(LocalDate date, String employeeCode, String status, Pageable pageable);
    AttendanceRecord getRecordById(Long id);
    DashboardStatsDto getDashboardStats();
}
