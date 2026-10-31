package com.example.demo.service;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.demo.dto.LeaveApplicationRequest;
import com.example.demo.dto.LeaveResponseDto;

public interface LeaveService {
    LeaveResponseDto applyLeave(String username, LeaveApplicationRequest request);
    Page<LeaveResponseDto> getMyLeaves(String username, Pageable pageable);
    Page<LeaveResponseDto> getPendingLeaves(Pageable pageable);
    Page<LeaveResponseDto> getAllLeaves(Pageable pageable);
    LeaveResponseDto approveLeave(Long leaveId, String approvedBy);
    LeaveResponseDto rejectLeave(Long leaveId, String approvedBy, String rejectionReason);
    void cancelLeave(Long leaveId, String username);
    boolean isEmployeeOnApprovedLeave(String empCode, LocalDate date);
}
