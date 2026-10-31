package com.example.demo.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
import com.example.demo.dto.EmployeeDto;
import com.example.demo.dto.FaceEnrollmentRequest;
import com.example.demo.model.Employee;
import com.example.demo.model.EmployeeStatus;
import com.example.demo.service.EmployeeService;
import com.example.demo.service.FaceVerificationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final FaceVerificationService faceVerificationService;

    public EmployeeController(EmployeeService employeeService, FaceVerificationService faceVerificationService) {
        this.employeeService = employeeService;
        this.faceVerificationService = faceVerificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<EmployeeDto>>> getEmployees(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        EmployeeStatus empStatus = null;
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            try {
                empStatus = EmployeeStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<EmployeeDto> result = employeeService.searchEmployees(keyword, department, empStatus, pageable);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Employee>> getEmployeeById(@PathVariable Long id) {
        Employee employee = employeeService.getEmployeeById(id);
        return ResponseEntity.ok(ApiResponse.ok(employee));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<Employee>> getEmployeeByCode(@PathVariable String code) {
        Employee employee = employeeService.getByEmpCode(code);
        return ResponseEntity.ok(ApiResponse.ok(employee));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Employee>> createEmployee(@Valid @RequestBody EmployeeDto dto) {
        Employee created = employeeService.createFromDto(dto);
        return ResponseEntity.ok(ApiResponse.ok("Employee registered successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Employee>> updateEmployee(@PathVariable Long id, @Valid @RequestBody EmployeeDto dto) {
        Employee updated = employeeService.updateFromDto(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Employee updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEmployee(@PathVariable Long id) {
        employeeService.deactivateEmployee(id);
        return ResponseEntity.ok(ApiResponse.ok("Employee deactivated successfully", null));
    }

    @PostMapping("/{id}/enroll-face")
    public ResponseEntity<ApiResponse<Void>> enrollFace(@PathVariable Long id, @Valid @RequestBody FaceEnrollmentRequest request) {
        faceVerificationService.enrollFace(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Face profile enrolled successfully", null));
    }

    @PutMapping("/{id}/activate")
public ResponseEntity<ApiResponse<Void>> activateEmployee(@PathVariable Long id) {
    employeeService.activateEmployee(id);
    return ResponseEntity.ok(
            ApiResponse.ok("Employee activated successfully", null)
    );
}

}
