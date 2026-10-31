package com.example.demo.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.exception.DuplicateResourceException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Department;
import com.example.demo.repository.DepartmentRepository;
import com.example.demo.service.DepartmentService;

@Service
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository repo;

    public DepartmentServiceImpl(DepartmentRepository repo) {
        this.repo = repo;
    }

    @Override
    @Transactional
    public Department create(Department department) {
        if (repo.existsByDepartmentNameIgnoreCase(department.getDepartmentName())) {
            throw new DuplicateResourceException(
                    "Department already exists with name: "
                            + department.getDepartmentName());
        }

        return repo.save(department);
    }

    @Override
    @Transactional
    public Department update(Long id, Department updated) {

        Department existing = repo.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Department not found with id: " + id));

        if (!existing.getDepartmentName()
                .equalsIgnoreCase(updated.getDepartmentName())
                && repo.existsByDepartmentNameIgnoreCase(
                        updated.getDepartmentName())) {

            throw new DuplicateResourceException(
                    "Department already exists with name: "
                            + updated.getDepartmentName());
        }

        existing.setDepartmentName(updated.getDepartmentName());
        existing.setDescription(updated.getDescription());
        existing.setActive(updated.isActive());

        return repo.save(existing);
    }

    @Override
    public Department getById(Long id) {
        return repo.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Department not found with id: " + id));
    }

    @Override
    public List<Department> getAll() {
        return repo.findAll();
    }

    @Override
    public List<Department> getActive() {
        return repo.findByActiveTrue();
    }
    
    @Override
    @Transactional
    public void delete(Long id) {
        Department existing = getById(id);
        repo.delete(existing);
    }
    

    // =========================
    // ACTIVATE DEPARTMENT
    // =========================
    @Override
    @Transactional
    public void activate(Long id) {

        Department existing = getById(id);

        existing.setActive(true);

        repo.save(existing);
    }

    // =========================
    // DEACTIVATE DEPARTMENT
    // =========================
    @Override
    @Transactional
    public void deactivate(Long id) {

        Department existing = getById(id);

        existing.setActive(false);

        repo.save(existing);
    }
}