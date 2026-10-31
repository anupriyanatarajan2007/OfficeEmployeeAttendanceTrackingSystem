package com.example.demo.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.model.LeaveRequest;
import com.example.demo.model.LeaveStatus;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findByEmployeeIdOrderByAppliedAtDesc(Long employeeId);

    Page<LeaveRequest> findByEmployeeIdOrderByAppliedAtDesc(Long employeeId, Pageable pageable);

    List<LeaveRequest> findByStatus(LeaveStatus status);

    Page<LeaveRequest> findByStatusOrderByAppliedAtDesc(LeaveStatus status, Pageable pageable);

    @Query("SELECT l FROM LeaveRequest l WHERE l.employee.id = :employeeId " +
           "AND l.status = 'APPROVED' " +
           "AND :date BETWEEN l.startDate AND l.endDate")
    List<LeaveRequest> findApprovedLeaveByEmployeeAndDate(
            @Param("employeeId") Long employeeId,
            @Param("date") LocalDate date);

    @Query("SELECT l FROM LeaveRequest l WHERE l.employee.empCode = :empCode " +
           "AND l.status = 'APPROVED' " +
           "AND :date BETWEEN l.startDate AND l.endDate")
    List<LeaveRequest> findApprovedLeaveByEmpCodeAndDate(
            @Param("empCode") String empCode,
            @Param("date") LocalDate date);

    @Query("SELECT l FROM LeaveRequest l WHERE l.employee.id = :employeeId " +
           "AND l.status IN ('PENDING', 'APPROVED') " +
           "AND NOT (l.endDate < :startDate OR l.startDate > :endDate)")
    List<LeaveRequest> findOverlappingLeaves(
            @Param("employeeId") Long employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    long countByStatus(LeaveStatus status);
}
