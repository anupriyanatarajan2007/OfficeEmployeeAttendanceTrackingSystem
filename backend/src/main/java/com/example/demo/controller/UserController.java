package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.LoginResponse;
import com.example.demo.dto.ThemeUpdateRequest;
import com.example.demo.model.Employee;
import com.example.demo.model.ThemePreference;
import com.example.demo.model.User;
import com.example.demo.repository.EmployeeRepository;
import com.example.demo.repository.UserRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;

    public UserController(UserRepository userRepository, EmployeeRepository employeeRepository) {
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<LoginResponse>> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        Employee employee = employeeRepository.findByUserUsername(username).orElse(null);

        LoginResponse response = new LoginResponse(
                null,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                employee != null ? employee.getEmpCode() : null,
                employee != null ? employee.getName() : user.getUsername(),
                employee != null ? employee.getDepartment() : null,
                user.getThemePreference().name()
        );

        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/me/theme")
    public ResponseEntity<ApiResponse<LoginResponse>> updateThemePreference(@Valid @RequestBody ThemeUpdateRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Unauthorized: Authentication required");
        }
        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        ThemePreference newTheme = ThemePreference.fromString(request.getThemePreference());
        user.setThemePreference(newTheme);
        userRepository.save(user);

        Employee employee = employeeRepository.findByUserUsername(username).orElse(null);

        LoginResponse response = new LoginResponse(
                null,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                employee != null ? employee.getEmpCode() : null,
                employee != null ? employee.getName() : user.getUsername(),
                employee != null ? employee.getDepartment() : null,
                user.getThemePreference().name()
        );

        return ResponseEntity.ok(ApiResponse.ok("Theme preference updated to " + newTheme.name(), response));
    }
}
