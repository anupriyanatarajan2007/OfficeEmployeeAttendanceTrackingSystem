package com.example.demo.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.demo.dto.EmployeeDto;
import com.example.demo.model.Employee;
import com.example.demo.model.EmployeeStatus;

public interface EmployeeService {

    // Preserved exact 4 original method signatures
    Employee addEmployee(Employee employee);
    Employee getEmployeeById(Long id);
    Employee updateEmployee(Long id, Employee employee);
    List<Employee> getAllEmployees();

    // Extended production methods
    Employee createFromDto(EmployeeDto dto);
    Employee updateFromDto(Long id, EmployeeDto dto);
    Employee getByEmpCode(String empCode);
    Employee getByUsername(String username);
    Page<EmployeeDto> searchEmployees(String keyword, String department, EmployeeStatus status, Pageable pageable);
    void deactivateEmployee(Long id);
    void activateEmployee(Long id);
    long countTotalEmployees();
    long countActiveEmployees();
}
