package com.example.demo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.AttendanceLog;
import com.example.demo.service.AttendanceLogService;

@RestController
@RequestMapping("/attendancelogs")
public class AttendanceLogController {

    private final AttendanceLogService service;

    public AttendanceLogController(AttendanceLogService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<AttendanceLog> addAttendanceLog(@RequestBody AttendanceLog log) {
        AttendanceLog saved = service.create(log);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AttendanceLog> updateAttendanceLog(@PathVariable Long id, @RequestBody AttendanceLog log) {
        return ResponseEntity.ok(service.update(id, log));
    }

    @GetMapping
    public ResponseEntity<List<AttendanceLog>> getAllAttendanceLogs() {
        return ResponseEntity.ok(service.getAll());
    }
}
