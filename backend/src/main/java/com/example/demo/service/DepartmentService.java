package com.example.demo.service;

import java.util.List;

import com.example.demo.model.Department;

public interface DepartmentService {

    Department create(Department department);

    Department update(Long id, Department department);

    Department getById(Long id);

    List<Department> getAll();

    List<Department> getActive();

    void delete(Long id);

    void activate(Long id);

    void deactivate(Long id);
}