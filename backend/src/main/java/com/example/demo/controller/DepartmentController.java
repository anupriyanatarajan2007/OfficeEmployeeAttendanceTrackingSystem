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
import com.example.demo.model.Department;
import com.example.demo.service.DepartmentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    // Get all departments
    // Example:
    // GET /api/departments
    @GetMapping
    public ResponseEntity<ApiResponse<List<Department>>> getAll(
            @RequestParam(defaultValue = "false") boolean activeOnly) {

        List<Department> list = activeOnly
                ? departmentService.getActive()
                : departmentService.getAll();

        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    // Get department by ID
    // Example:
    // GET /api/departments/1
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Department>> getById(
            @PathVariable Long id) {

        Department dept = departmentService.getById(id);

        return ResponseEntity.ok(ApiResponse.ok(dept));
    }

    // Create department
    // Example:
    // POST /api/departments
    @PostMapping
    public ResponseEntity<ApiResponse<Department>> create(
            @Valid @RequestBody Department department) {

        Department created = departmentService.create(department);

        return ResponseEntity.ok(
                ApiResponse.ok("Department created successfully", created)
        );
    }

    // Update department
    // Example:
    // PUT /api/departments/1
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Department>> update(
            @PathVariable Long id,
            @Valid @RequestBody Department department) {

        Department updated = departmentService.update(id, department);

        return ResponseEntity.ok(
                ApiResponse.ok("Department updated successfully", updated)
        );
    }

 
    // Soft delete department
    // Example:
    // DELETE /api/departments/1
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id) {

        departmentService.delete(id);

        return ResponseEntity.ok(
                ApiResponse.ok("Department deleted successfully", null)
        );
    }

    @PutMapping("/{id}/activate")
public ResponseEntity<ApiResponse<Void>> activate(
        @PathVariable Long id) {

    departmentService.activate(id);

    return ResponseEntity.ok(
            ApiResponse.ok("Department activated successfully", null)
    );
}

@PutMapping("/{id}/deactivate")
public ResponseEntity<ApiResponse<Void>> deactivate(
        @PathVariable Long id) {

    departmentService.deactivate(id);

    return ResponseEntity.ok(
            ApiResponse.ok("Department deactivated successfully", null)
    );
}

}