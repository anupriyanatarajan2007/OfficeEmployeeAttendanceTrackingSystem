package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.AttendanceRecord;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
}
