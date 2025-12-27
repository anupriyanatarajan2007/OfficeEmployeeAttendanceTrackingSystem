package com.example.demo.service;



import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.model.AttendanceRecord;
import com.example.demo.repository.AttendanceRecordRepository;

@Service
public class AttendanceRecordServiceImpl implements AttendanceRecordService {

    private final AttendanceRecordRepository repo;

    public AttendanceRecordServiceImpl(AttendanceRecordRepository repo) {
        this.repo = repo;
    }

    @Override
    public AttendanceRecord create(AttendanceRecord record) {
        return repo.save(record);
    }

    @Override
    public List<AttendanceRecord> getAll() {
        return repo.findAll();
    }
}
