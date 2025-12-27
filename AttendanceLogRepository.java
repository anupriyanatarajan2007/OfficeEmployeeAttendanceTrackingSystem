package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.AttendanceLog;

@Repository
public interface AttendanceLogRepository extends JpaRepository<AttendanceLog, Long> {
}
