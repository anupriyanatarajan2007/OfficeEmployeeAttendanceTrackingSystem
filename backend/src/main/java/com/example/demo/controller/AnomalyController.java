package com.example.demo.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.ApiResponse;
import com.example.demo.model.AttendanceAnomaly;
import com.example.demo.service.AnomalyDetectionService;

@RestController
@RequestMapping("/api/anomalies")
public class AnomalyController {

    private final AnomalyDetectionService anomalyService;

    public AnomalyController(AnomalyDetectionService anomalyService) {
        this.anomalyService = anomalyService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AttendanceAnomaly>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AttendanceAnomaly> anomalies = anomalyService.getAllAnomalies(pageable);
        return ResponseEntity.ok(ApiResponse.ok(anomalies));
    }

    @GetMapping("/unresolved")
    public ResponseEntity<ApiResponse<List<AttendanceAnomaly>>> getUnresolved() {
        List<AttendanceAnomaly> list = anomalyService.getUnresolvedAnomalies();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<ApiResponse<AttendanceAnomaly>> resolve(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "Resolved by administrator") String resolutionNote) {
        AttendanceAnomaly resolved = anomalyService.resolveAnomaly(id, resolutionNote);
        return ResponseEntity.ok(ApiResponse.ok("Anomaly resolved", resolved));
    }
}
