package com.example.demo.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.AdminUser;
import com.example.demo.service.AdminUserService;

@RestController
@RequestMapping("/admin")
public class AdminUserController {

    private final AdminUserService service;

    public AdminUserController(AdminUserService service) {
        this.service = service;
    }

    @PostMapping("/create")
    public ResponseEntity<AdminUser> createAdmin(@RequestBody AdminUser admin) {
        return ResponseEntity.ok(service.create(admin));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminUser> getAdminById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminUser> updateAdmin(@PathVariable Long id, @RequestBody AdminUser admin) {
        return ResponseEntity.ok(service.update(id, admin));
    }

    @GetMapping
    public ResponseEntity<List<AdminUser>> getAllAdmins() {
        return ResponseEntity.ok(service.getAll());
    }
}
