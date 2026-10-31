package com.example.demo.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.LeaveApplicationRequest;
import com.example.demo.dto.LeaveResponseDto;
import com.example.demo.exception.InvalidAttendanceOperationException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.AttendanceRecord;
import com.example.demo.model.AttendanceStatus;
import com.example.demo.model.Employee;
import com.example.demo.model.LeaveRequest;
import com.example.demo.model.LeaveStatus;
import com.example.demo.model.NotificationType;
import com.example.demo.repository.AttendanceRecordRepository;
import com.example.demo.repository.EmployeeRepository;
import com.example.demo.repository.LeaveRequestRepository;
import com.example.demo.service.AuditLogService;
import com.example.demo.service.LeaveService;
import com.example.demo.service.NotificationService;

@Service
public class LeaveServiceImpl implements LeaveService {

    private final LeaveRequestRepository leaveRepo;
    private final EmployeeRepository employeeRepo;
    private final AttendanceRecordRepository attendanceRecordRepo;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public LeaveServiceImpl(LeaveRequestRepository leaveRepo,
                            EmployeeRepository employeeRepo,
                            AttendanceRecordRepository attendanceRecordRepo,
                            NotificationService notificationService,
                            AuditLogService auditLogService) {
        this.leaveRepo = leaveRepo;
        this.employeeRepo = employeeRepo;
        this.attendanceRecordRepo = attendanceRecordRepo;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    private Employee getEmployeeByPrincipal(String username) {
        return employeeRepo.findByUserUsername(username)
                .or(() -> employeeRepo.findOptionalByEmpCode(username))
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for user: " + username));
    }

    @Override
    @Transactional
    public LeaveResponseDto applyLeave(String username, LeaveApplicationRequest request) {
        Employee employee = getEmployeeByPrincipal(username);

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new InvalidAttendanceOperationException("Leave end date cannot be before start date");
        }

        // Check for overlapping leaves
        List<LeaveRequest> overlapping = leaveRepo.findOverlappingLeaves(
                employee.getId(), request.getStartDate(), request.getEndDate());
        if (!overlapping.isEmpty()) {
            throw new InvalidAttendanceOperationException("You already have an active or pending leave application for this date range");
        }

        LeaveRequest leave = new LeaveRequest();
        leave.setEmployee(employee);
        leave.setLeaveType(request.getLeaveType());
        leave.setStartDate(request.getStartDate());
        leave.setEndDate(request.getEndDate());
        leave.setReason(request.getReason());
        leave.setStatus(LeaveStatus.PENDING);
        leave.setAppliedAt(LocalDateTime.now());

        LeaveRequest saved = leaveRepo.save(leave);

        // Audit Log
        auditLogService.logAction(username, "APPLY_LEAVE", "LeaveRequest", saved.getId().toString(),
                "Leave applied: " + request.getLeaveType() + " from " + request.getStartDate() + " to " + request.getEndDate(), null);

        return LeaveResponseDto.fromEntity(saved);
    }

    @Override
    public Page<LeaveResponseDto> getMyLeaves(String username, Pageable pageable) {
        Employee employee = getEmployeeByPrincipal(username);
        return leaveRepo.findByEmployeeIdOrderByAppliedAtDesc(employee.getId(), pageable)
                .map(LeaveResponseDto::fromEntity);
    }

    @Override
    public Page<LeaveResponseDto> getPendingLeaves(Pageable pageable) {
        return leaveRepo.findByStatusOrderByAppliedAtDesc(LeaveStatus.PENDING, pageable)
                .map(LeaveResponseDto::fromEntity);
    }

    @Override
    public Page<LeaveResponseDto> getAllLeaves(Pageable pageable) {
        return leaveRepo.findAll(pageable)
                .map(LeaveResponseDto::fromEntity);
    }

    @Override
    @Transactional
    public LeaveResponseDto approveLeave(Long leaveId, String approvedBy) {
        LeaveRequest leave = leaveRepo.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + leaveId));

        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new InvalidAttendanceOperationException("Only PENDING leave requests can be approved");
        }

        leave.setStatus(LeaveStatus.APPROVED);
        leave.setApprovedBy(approvedBy);
        leave.setApprovedAt(LocalDateTime.now());
        LeaveRequest saved = leaveRepo.save(leave);

        // Notify employee
        Employee emp = leave.getEmployee();
        if (emp != null && emp.getUser() != null) {
            String msg = String.format("Your %s leave request from %s to %s has been APPROVED by %s.",
                    leave.getLeaveType(), leave.getStartDate(), leave.getEndDate(), approvedBy);
            notificationService.sendNotification(emp.getUser(), "Leave Approved", msg, NotificationType.SUCCESS);
        }

        // If today falls within approved range, update or create AttendanceRecord as LEAVE
        LocalDate today = LocalDate.now();
        if (!today.isBefore(leave.getStartDate()) && !today.isAfter(leave.getEndDate())) {
            AttendanceRecord record = attendanceRecordRepo.findByEmployeeCodeAndDate(emp.getEmpCode(), today)
                    .orElseGet(() -> {
                        AttendanceRecord r = new AttendanceRecord();
                        r.setEmployee(emp);
                        r.setEmployeeCode(emp.getEmpCode());
                        r.setDate(today);
                        return r;
                    });
            record.setStatus(AttendanceStatus.LEAVE.name());
            attendanceRecordRepo.save(record);
        }

        // Audit Log
        auditLogService.logAction(approvedBy, "APPROVE_LEAVE", "LeaveRequest", leaveId.toString(),
                "Approved leave request for " + emp.getEmpCode(), null);

        return LeaveResponseDto.fromEntity(saved);
    }

    @Override
    @Transactional
    public LeaveResponseDto rejectLeave(Long leaveId, String approvedBy, String rejectionReason) {
        LeaveRequest leave = leaveRepo.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + leaveId));

        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new InvalidAttendanceOperationException("Only PENDING leave requests can be rejected");
        }

        leave.setStatus(LeaveStatus.REJECTED);
        leave.setApprovedBy(approvedBy);
        leave.setApprovedAt(LocalDateTime.now());
        leave.setRejectionReason(rejectionReason != null ? rejectionReason : "Application rejected by manager");
        LeaveRequest saved = leaveRepo.save(leave);

        // Notify employee
        Employee emp = leave.getEmployee();
        if (emp != null && emp.getUser() != null) {
            String msg = String.format("Your %s leave request from %s to %s was REJECTED. Reason: %s",
                    leave.getLeaveType(), leave.getStartDate(), leave.getEndDate(), leave.getRejectionReason());
            notificationService.sendNotification(emp.getUser(), "Leave Rejected", msg, NotificationType.WARNING);
        }

        // Audit Log
        auditLogService.logAction(approvedBy, "REJECT_LEAVE", "LeaveRequest", leaveId.toString(),
                "Rejected leave request for " + emp.getEmpCode() + ". Reason: " + rejectionReason, null);

        return LeaveResponseDto.fromEntity(saved);
    }

    @Override
    @Transactional
    public void cancelLeave(Long leaveId, String username) {
        Employee emp = getEmployeeByPrincipal(username);
        LeaveRequest leave = leaveRepo.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + leaveId));

        if (!leave.getEmployee().getId().equals(emp.getId())) {
            throw new InvalidAttendanceOperationException("You can only cancel your own leave requests");
        }
        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new InvalidAttendanceOperationException("Only PENDING leave requests can be cancelled");
        }

        leave.setStatus(LeaveStatus.CANCELLED);
        leaveRepo.save(leave);
    }

    @Override
    public boolean isEmployeeOnApprovedLeave(String empCode, LocalDate date) {
        List<LeaveRequest> leaves = leaveRepo.findApprovedLeaveByEmpCodeAndDate(empCode, date);
        return !leaves.isEmpty();
    }
}
