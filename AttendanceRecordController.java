package com.example.demo.controller;


import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.AttendanceRecord;
import com.example.demo.service.AttendanceRecordService;

@RestController
@RequestMapping("/attendance-records")
public class AttendanceRecordController {

    private final AttendanceRecordService service;

    public AttendanceRecordController(AttendanceRecordService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<AttendanceRecord> create(@RequestBody AttendanceRecord record) {
        return ResponseEntity.ok(service.create(record));
    }

    @GetMapping
    public ResponseEntity<List<AttendanceRecord>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }
}
