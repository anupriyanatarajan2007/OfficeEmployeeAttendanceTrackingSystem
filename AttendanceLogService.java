package com.example.demo.service;


import java.util.List;
import java.util.Optional;

import com.example.demo.model.AttendanceLog;

public interface AttendanceLogService {
    AttendanceLog create(AttendanceLog log);
    Optional<AttendanceLog> getById(Long id);
    AttendanceLog update(Long id, AttendanceLog log);
    List<AttendanceLog> getAll();
}
