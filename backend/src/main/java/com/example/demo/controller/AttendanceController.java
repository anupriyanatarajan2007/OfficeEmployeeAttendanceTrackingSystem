package com.example.demo.controller;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.AttendanceCheckInRequest;
import com.example.demo.dto.AttendanceCheckOutRequest;
import com.example.demo.dto.AttendanceResponseDto;
import com.example.demo.dto.DashboardStatsDto;
import com.example.demo.dto.FaceVerificationRequest;
import com.example.demo.dto.FaceVerificationResponse;
import com.example.demo.dto.LocationVerificationRequest;
import com.example.demo.dto.LocationVerificationResponse;
import com.example.demo.dto.QrVerificationRequest;
import com.example.demo.dto.QrVerificationResponse;
import com.example.demo.service.AttendanceService;
import com.example.demo.service.DynamicQrService;
import com.example.demo.service.FaceVerificationService;
import com.example.demo.service.LocationVerificationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final LocationVerificationService locationVerificationService;
    private final FaceVerificationService faceVerificationService;
    private final DynamicQrService dynamicQrService;

    public AttendanceController(AttendanceService attendanceService,
                                LocationVerificationService locationVerificationService,
                                FaceVerificationService faceVerificationService,
                                DynamicQrService dynamicQrService) {
        this.attendanceService = attendanceService;
        this.locationVerificationService = locationVerificationService;
        this.faceVerificationService = faceVerificationService;
        this.dynamicQrService = dynamicQrService;
    }

    @PostMapping("/check-in")
    public ResponseEntity<ApiResponse<AttendanceResponseDto>> checkIn(
            Authentication authentication,
            @Valid @RequestBody AttendanceCheckInRequest request) {
        AttendanceResponseDto response = attendanceService.checkIn(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.ok("Check-in recorded successfully", response));
    }

    @PostMapping("/check-out")
    public ResponseEntity<ApiResponse<AttendanceResponseDto>> checkOut(
            Authentication authentication,
            @Valid @RequestBody AttendanceCheckOutRequest request) {
        AttendanceResponseDto response = attendanceService.checkOut(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.ok("Check-out recorded successfully", response));
    }

    @PostMapping("/verify-location")
    public ResponseEntity<ApiResponse<LocationVerificationResponse>> verifyLocation(
            @Valid @RequestBody LocationVerificationRequest request) {
        LocationVerificationResponse response = locationVerificationService.verifyLocation(request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/verify-face")
    public ResponseEntity<ApiResponse<FaceVerificationResponse>> verifyFace(
            @RequestParam String employeeCode,
            @Valid @RequestBody FaceVerificationRequest request) {
        FaceVerificationResponse response = faceVerificationService.verifyFace(employeeCode, request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/verify-qr")
    public ResponseEntity<ApiResponse<QrVerificationResponse>> verifyQr(
            @Valid @RequestBody QrVerificationRequest request) {
        QrVerificationResponse response = dynamicQrService.verifyQr(request.getQrToken());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<AttendanceResponseDto>> getToday(Authentication authentication) {
        Optional<AttendanceResponseDto> today = attendanceService.getTodayAttendance(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(today.orElse(null)));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Page<AttendanceResponseDto>>> getMyAttendance(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("date").descending());
        Page<AttendanceResponseDto> records = attendanceService.getMyAttendance(authentication.getName(), pageable);
        return ResponseEntity.ok(ApiResponse.ok(records));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AttendanceResponseDto>>> getAllAttendance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String employeeCode,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("date").descending());
        Page<AttendanceResponseDto> records = attendanceService.searchAttendance(date, employeeCode, status, pageable);
        return ResponseEntity.ok(ApiResponse.ok(records));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getSummary() {
        DashboardStatsDto stats = attendanceService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }
}
