package com.example.demo.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.model.AttendanceRecord;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {

    Optional<AttendanceRecord> findByEmployeeCodeAndDate(String employeeCode, LocalDate date);

    Optional<AttendanceRecord> findByEmployeeIdAndDate(Long employeeId, LocalDate date);

    List<AttendanceRecord> findByEmployeeCodeOrderByDateDesc(String employeeCode);

    Page<AttendanceRecord> findByEmployeeCodeOrderByDateDesc(String employeeCode, Pageable pageable);

    List<AttendanceRecord> findByDate(LocalDate date);

    long countByDateAndStatus(LocalDate date, String status);

    @Query("SELECT COUNT(a) FROM AttendanceRecord a WHERE a.date = :date AND a.lateMinutes > 0")
    long countLateArrivalsByDate(@Param("date") LocalDate date);

    @Query("SELECT a FROM AttendanceRecord a WHERE " +
           "(:date IS NULL OR a.date = :date) AND " +
           "(:employeeCode IS NULL OR :employeeCode = '' OR LOWER(a.employeeCode) LIKE LOWER(CONCAT('%', :employeeCode, '%'))) AND " +
           "(:status IS NULL OR :status = '' OR a.status = :status)")
    Page<AttendanceRecord> searchAttendance(
            @Param("date") LocalDate date,
            @Param("employeeCode") String employeeCode,
            @Param("status") String status,
            Pageable pageable);

    List<AttendanceRecord> findByDateBetween(LocalDate start, LocalDate end);

    List<AttendanceRecord> findByEmployeeCodeAndDateBetween(String employeeCode, LocalDate start, LocalDate end);
}
