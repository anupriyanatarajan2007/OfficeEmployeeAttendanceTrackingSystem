package com.example.demo.service;

import java.util.List;

import com.example.demo.model.AttendanceRecord;

public interface AttendanceRecordService {
    AttendanceRecord create(AttendanceRecord record);
    List<AttendanceRecord> getAll();
}
