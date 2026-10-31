package com.example.demo.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.LeaveApplicationRequest;
import com.example.demo.dto.LeaveResponseDto;
import com.example.demo.service.LeaveService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<LeaveResponseDto>> applyLeave(
            Authentication authentication,
            @Valid @RequestBody LeaveApplicationRequest request) {
        LeaveResponseDto result = leaveService.applyLeave(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.ok("Leave application submitted successfully", result));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Page<LeaveResponseDto>>> getMyLeaves(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());
        Page<LeaveResponseDto> result = leaveService.getMyLeaves(authentication.getName(), pageable);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<Page<LeaveResponseDto>>> getPendingLeaves(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").ascending());
        Page<LeaveResponseDto> result = leaveService.getPendingLeaves(pageable);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<LeaveResponseDto>>> getAllLeaves(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());
        Page<LeaveResponseDto> result = leaveService.getAllLeaves(pageable);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<LeaveResponseDto>> approveLeave(
            @PathVariable Long id,
            Authentication authentication) {
        LeaveResponseDto result = leaveService.approveLeave(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Leave approved successfully", result));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<LeaveResponseDto>> rejectLeave(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "Rejected by reviewer") String reason,
            Authentication authentication) {
        LeaveResponseDto result = leaveService.rejectLeave(id, authentication.getName(), reason);
        return ResponseEntity.ok(ApiResponse.ok("Leave rejected", result));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelLeave(
            @PathVariable Long id,
            Authentication authentication) {
        leaveService.cancelLeave(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Leave cancelled successfully", null));
    }
}
