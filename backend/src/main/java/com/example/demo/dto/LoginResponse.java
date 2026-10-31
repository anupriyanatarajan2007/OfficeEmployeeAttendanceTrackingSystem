package com.example.demo.dto;

public class LoginResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private String role;
    private String employeeCode;
    private String employeeName;
    private String department;
    private String themePreference = "DARK";

    public LoginResponse() {}

    public LoginResponse(String token, Long id, String username, String email, String role,
                         String employeeCode, String employeeName, String department) {
        this(token, id, username, email, role, employeeCode, employeeName, department, "DARK");
    }

    public LoginResponse(String token, Long id, String username, String email, String role,
                         String employeeCode, String employeeName, String department, String themePreference) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.employeeCode = employeeCode;
        this.employeeName = employeeName;
        this.department = department;
        this.themePreference = (themePreference != null && !themePreference.isBlank()) ? themePreference : "DARK";
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getEmployeeCode() { return employeeCode; }
    public void setEmployeeCode(String employeeCode) { this.employeeCode = employeeCode; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getThemePreference() { return themePreference; }
    public void setThemePreference(String themePreference) { this.themePreference = themePreference; }
}
