package com.example.demo.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.demo.model.AdminUser;
import com.example.demo.repository.AdminUserRepository;

@Service
public class AdminUserServiceImpl implements AdminUserService {

    private final AdminUserRepository repo;

    public AdminUserServiceImpl(AdminUserRepository repo) {
        this.repo = repo;
    }

    @Override
    public AdminUser create(AdminUser admin) {
        return repo.save(admin);
    }

    @Override
    public Optional<AdminUser> getById(Long id) {
        return repo.findById(id);
    }

    @Override
    public AdminUser update(Long id, AdminUser admin) {
        return repo.findById(id).map(existing -> {
            existing.setUsername(admin.getUsername());
            existing.setPassword(admin.getPassword());
            return repo.save(existing);
        }).orElseThrow();
    }

    @Override
    public List<AdminUser> getAll() {
        return repo.findAll();
    }
}
