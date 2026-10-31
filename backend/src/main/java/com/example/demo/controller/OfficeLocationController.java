package com.example.demo.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.ApiResponse;
import com.example.demo.model.OfficeLocation;
import com.example.demo.service.OfficeLocationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/office-location")
public class OfficeLocationController {

    private final OfficeLocationService officeLocationService;

    public OfficeLocationController(OfficeLocationService officeLocationService) {
        this.officeLocationService = officeLocationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<OfficeLocation>> getActiveOffice() {
        OfficeLocation office = officeLocationService.getActiveOffice();
        return ResponseEntity.ok(ApiResponse.ok(office));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<OfficeLocation>>> getAll() {
        List<OfficeLocation> list = officeLocationService.getAll();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OfficeLocation>> create(@Valid @RequestBody OfficeLocation location) {
        OfficeLocation created = officeLocationService.create(location);
        return ResponseEntity.ok(ApiResponse.ok("Office location saved successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<OfficeLocation>> update(@PathVariable Long id, @Valid @RequestBody OfficeLocation location) {
        OfficeLocation updated = officeLocationService.update(id, location);
        return ResponseEntity.ok(ApiResponse.ok("Office location updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        officeLocationService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Office location deleted successfully", null));
    }
}
