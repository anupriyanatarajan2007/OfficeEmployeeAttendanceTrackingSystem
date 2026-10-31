package com.example.demo.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.demo.model.AttendanceLog;
import com.example.demo.repository.AttendanceLogRepository;

@Service
public class AttendanceLogServiceImpl implements AttendanceLogService {

    private final AttendanceLogRepository repo;

    public AttendanceLogServiceImpl(AttendanceLogRepository repo) {
        this.repo = repo;
    }

    @Override
    public AttendanceLog create(AttendanceLog log) {
        return repo.save(log);
    }

    @Override
    public Optional<AttendanceLog> getById(Long id) {
        return repo.findById(id);
    }

    @Override
    public AttendanceLog update(Long id, AttendanceLog log) {
        return repo.findById(id).map(existing -> {
            existing.setEmployeeCode(log.getEmployeeCode());
            existing.setDate(log.getDate());
            if (log.getCheckInTime() != null) existing.setCheckInTime(log.getCheckInTime());
            if (log.getCheckOutTime() != null) existing.setCheckOutTime(log.getCheckOutTime());
            if (log.getEventType() != null) existing.setEventType(log.getEventType());
            if (log.getStatus() != null) existing.setStatus(log.getStatus());
            if (log.getMessage() != null) existing.setMessage(log.getMessage());
            return repo.save(existing);
        }).orElseThrow();
    }

    @Override
    public List<AttendanceLog> getAll() {
        return repo.findAll();
    }
}
