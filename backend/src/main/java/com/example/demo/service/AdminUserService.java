package com.example.demo.service;

import java.util.List;
import java.util.Optional;

import com.example.demo.model.AdminUser;

public interface AdminUserService {
    AdminUser create(AdminUser admin);
    Optional<AdminUser> getById(Long id);
    AdminUser update(Long id, AdminUser admin);
    List<AdminUser> getAll();
}
