
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.ApiResponse;
import com.example.demo.model.Shift;
import com.example.demo.service.ShiftService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/shifts")
public class ShiftController {

    private final ShiftService shiftService;

    public ShiftController(ShiftService shiftService) {
        this.shiftService = shiftService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Shift>>> getAll(
            @RequestParam(defaultValue = "false") boolean activeOnly) {

        List<Shift> list = activeOnly
                ? shiftService.getActive()
                : shiftService.getAll();

        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Shift>> getById(
            @PathVariable Long id) {

        Shift shift = shiftService.getById(id);

        return ResponseEntity.ok(ApiResponse.ok(shift));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Shift>> create(
            @Valid @RequestBody Shift shift) {

        Shift created = shiftService.create(shift);

        return ResponseEntity.ok(
                ApiResponse.ok(
                        "Shift created successfully",
                        created
                )
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Shift>> update(
            @PathVariable Long id,
            @Valid @RequestBody Shift shift) {

        Shift updated = shiftService.update(id, shift);

        return ResponseEntity.ok(
                ApiResponse.ok(
                        "Shift updated successfully",
                        updated
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id) {

        shiftService.delete(id);

        return ResponseEntity.ok(
                ApiResponse.ok(
                        "Shift deleted successfully",
                        null
                )
        );
    }
}
