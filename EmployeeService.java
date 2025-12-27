package com.example.demo.service;


import java.util.List;

import com.example.demo.model.Employee;

public interface EmployeeService {

    Employee addEmployee(Employee employee);

    Employee getEmployeeById(Long id);

    Employee updateEmployee(Long id, Employee employee);

    List<Employee> getAllEmployees();
}


