package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.dto.ThemeUpdateRequest;
import com.example.demo.model.Employee;
import com.example.demo.model.ThemePreference;
import com.example.demo.model.User;
import com.example.demo.repository.EmployeeRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtTokenProvider;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtTokenProvider tokenProvider,
                          UserRepository userRepository,
                          EmployeeRepository employeeRepository) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("User details not found"));

        Employee employee = employeeRepository.findByUserUsername(user.getUsername()).orElse(null);

        LoginResponse response = new LoginResponse(
                jwt,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                employee != null ? employee.getEmpCode() : null,
                employee != null ? employee.getName() : user.getUsername(),
                employee != null ? employee.getDepartment() : null,
                user.getThemePreference().name()
        );

        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
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
