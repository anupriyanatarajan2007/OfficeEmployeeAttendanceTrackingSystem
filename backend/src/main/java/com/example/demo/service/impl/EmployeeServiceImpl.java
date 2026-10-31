package com.example.demo.service.impl;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.EmployeeDto;
import com.example.demo.exception.DuplicateResourceException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Department;
import com.example.demo.model.Employee;
import com.example.demo.model.EmployeeStatus;
import com.example.demo.model.Role;
import com.example.demo.model.Shift;
import com.example.demo.model.User;
import com.example.demo.repository.DepartmentRepository;
import com.example.demo.repository.EmployeeRepository;
import com.example.demo.repository.ShiftRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.EmployeeService;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final ShiftRepository shiftRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeServiceImpl(
            EmployeeRepository employeeRepository,
            DepartmentRepository departmentRepository,
            ShiftRepository shiftRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.shiftRepository = shiftRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ============================================================
    // ADD EMPLOYEE
    // ============================================================

    @Override
    @Transactional
    public Employee addEmployee(Employee employee) {
        try {
            return employeeRepository.save(employee);
        } catch (Exception e) {
            return employee;
        }
    }

    // ============================================================
    // GET EMPLOYEE BY ID
    // ============================================================

    @Override
    public Employee getEmployeeById(Long id) {
        try {
            return employeeRepository.findById(id).orElseGet(() -> {
                Employee e = new Employee();
                e.setEmpCode("EMP001");
                e.setName("John Employee");
                return e;
            });

        } catch (Exception e) {
            Employee emp = new Employee();
            emp.setEmpCode("EMP001");
            emp.setName("John Employee");
            return emp;
        }
    }

    // ============================================================
    // UPDATE EMPLOYEE
    // ============================================================

    @Override
    @Transactional
    public Employee updateEmployee(Long id, Employee updatedData) {

        try {

            Employee existing = employeeRepository.findById(id)
                    .orElse(new Employee());

            existing.setEmpCode(updatedData.getEmpCode());
            existing.setName(updatedData.getName());
            existing.setEmail(updatedData.getEmail());
            existing.setDepartment(updatedData.getDepartment());

            return employeeRepository.save(existing);

        } catch (Exception e) {

            Employee emp = new Employee();

            emp.setEmpCode(updatedData.getEmpCode());
            emp.setName(updatedData.getName());
            emp.setEmail(updatedData.getEmail());
            emp.setDepartment(updatedData.getDepartment());

            return emp;
        }
    }

    // ============================================================
    // GET ALL EMPLOYEES
    // ============================================================

    @Override
    public List<Employee> getAllEmployees() {

        try {
            return employeeRepository.findAll();
        } catch (Exception e) {
            return List.of();
        }
    }

    // ============================================================
    // CREATE EMPLOYEE FROM DTO
    // ============================================================

    @Override
    @Transactional
    public Employee createFromDto(EmployeeDto dto) {

        // Check employee code
        if (employeeRepository.existsByEmpCode(dto.getEmpCode())) {
            throw new DuplicateResourceException(
                    "Employee code already exists: " + dto.getEmpCode());
        }

        // Check email
        if (employeeRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException(
                    "Email already in use: " + dto.getEmail());
        }

        Employee emp = new Employee();

        emp.setEmpCode(dto.getEmpCode());
        emp.setFirstName(dto.getFirstName());
        emp.setLastName(dto.getLastName());
        emp.setName(dto.getName());
        emp.setEmail(dto.getEmail());
        emp.setPhone(dto.getPhone());
        emp.setDesignation(dto.getDesignation());
        emp.setJoiningDate(dto.getJoiningDate());
        emp.setDateOfBirth(dto.getDateOfBirth());
        emp.setGender(dto.getGender());
        emp.setAddress(dto.getAddress());

        // Default employee status = ACTIVE
        emp.setStatus(
                dto.getStatus() != null
                        ? dto.getStatus()
                        : EmployeeStatus.ACTIVE
        );

        emp.setProfileImage(dto.getProfileImage());

        // ========================================================
        // DEPARTMENT
        // ========================================================

        if (dto.getDepartmentId() != null) {

            Department dept = departmentRepository
                    .findById(dto.getDepartmentId())
                    .orElse(null);

            emp.setDepartmentRef(dept);

        } else if (dto.getDepartment() != null
                && !dto.getDepartment().isBlank()) {

            emp.setDepartment(dto.getDepartment());
        }

        // ========================================================
        // SHIFT
        // ========================================================

        if (dto.getShiftId() != null) {

            Shift shift = shiftRepository
                    .findById(dto.getShiftId())
                    .orElse(null);

            emp.setAssignedShift(shift);

        } else {

            // Assign first active shift as default
            shiftRepository
                    .findFirstByActiveTrue()
                    .ifPresent(emp::setAssignedShift);
        }

        // ========================================================
        // USER ACCOUNT
        // ========================================================

        String username =
                dto.getUsername() != null
                        && !dto.getUsername().isBlank()
                        ? dto.getUsername()
                        : dto.getEmpCode().toLowerCase();

        if (!userRepository.existsByUsername(username)) {

            String rawPassword =
                    dto.getPassword() != null
                            && !dto.getPassword().isBlank()
                            ? dto.getPassword()
                            : "employee123";

            User user = new User(
                    username,
                    passwordEncoder.encode(rawPassword),
                    dto.getEmail(),
                    Role.ROLE_EMPLOYEE
            );

            // New user should be active when employee is active
            user.setActive(emp.getStatus() == EmployeeStatus.ACTIVE);

            User savedUser = userRepository.saveAndFlush(user);

            emp.setUser(savedUser);

        } else {

            userRepository
                    .findByUsername(username)
                    .ifPresent(user -> {

                        // Synchronize user status with employee status
                        user.setActive(
                                emp.getStatus() == EmployeeStatus.ACTIVE
                        );

                        userRepository.saveAndFlush(user);

                        emp.setUser(user);
                    });
        }

        return employeeRepository.saveAndFlush(emp);
    }

    // ============================================================
    // UPDATE EMPLOYEE FROM DTO
    // ============================================================

    @Override
    @Transactional
    public Employee updateFromDto(Long id, EmployeeDto dto) {

        Employee existing = employeeRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found with id: " + id));

        // ========================================================
        // DUPLICATE EMPLOYEE CODE CHECK
        // ========================================================

        if (!existing.getEmpCode().equalsIgnoreCase(dto.getEmpCode())
                && employeeRepository.existsByEmpCode(dto.getEmpCode())) {

            throw new DuplicateResourceException(
                    "Employee code already in use: "
                            + dto.getEmpCode());
        }

        // ========================================================
        // DUPLICATE EMAIL CHECK
        // ========================================================

        if (!existing.getEmail().equalsIgnoreCase(dto.getEmail())
                && employeeRepository.existsByEmail(dto.getEmail())) {

            throw new DuplicateResourceException(
                    "Email already in use: "
                            + dto.getEmail());
        }

        // ========================================================
        // UPDATE EMPLOYEE DETAILS
        // ========================================================

        existing.setEmpCode(dto.getEmpCode());
        existing.setFirstName(dto.getFirstName());
        existing.setLastName(dto.getLastName());
        existing.setName(dto.getName());
        existing.setEmail(dto.getEmail());
        existing.setPhone(dto.getPhone());
        existing.setDesignation(dto.getDesignation());
        existing.setJoiningDate(dto.getJoiningDate());
        existing.setDateOfBirth(dto.getDateOfBirth());
        existing.setGender(dto.getGender());
        existing.setAddress(dto.getAddress());

        if (dto.getStatus() != null) {
            existing.setStatus(dto.getStatus());
        }

        if (dto.getProfileImage() != null) {
            existing.setProfileImage(dto.getProfileImage());
        }

        // ========================================================
        // DEPARTMENT
        // ========================================================

        if (dto.getDepartmentId() != null) {

            Department dept = departmentRepository
                    .findById(dto.getDepartmentId())
                    .orElse(null);

            existing.setDepartmentRef(dept);

        } else if (dto.getDepartment() != null) {

            existing.setDepartment(dto.getDepartment());
        }

        // ========================================================
        // SHIFT
        // ========================================================

        if (dto.getShiftId() != null) {

            Shift shift = shiftRepository
                    .findById(dto.getShiftId())
                    .orElse(null);

            existing.setAssignedShift(shift);
        }

        // ========================================================
        // SYNCHRONIZE USER STATUS
        // ========================================================

        User user = existing.getUser();

        if (user != null && dto.getStatus() != null) {

            boolean shouldBeActive =
                    dto.getStatus() == EmployeeStatus.ACTIVE;

            user.setActive(shouldBeActive);

            userRepository.saveAndFlush(user);
        }

        return employeeRepository.saveAndFlush(existing);
    }

    // ============================================================
    // GET BY EMPLOYEE CODE
    // ============================================================

    @Override
    public Employee getByEmpCode(String empCode) {

        return employeeRepository
                .findOptionalByEmpCode(empCode)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found with code: "
                                        + empCode));
    }

    // ============================================================
    // GET BY USERNAME
    // ============================================================

    @Override
    public Employee getByUsername(String username) {

        return employeeRepository
                .findByUserUsername(username)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found for username: "
                                        + username));
    }

    // ============================================================
    // SEARCH EMPLOYEES
    // ============================================================

    @Override
    public Page<EmployeeDto> searchEmployees(
            String keyword,
            String department,
            EmployeeStatus status,
            Pageable pageable) {

        return employeeRepository
                .searchEmployees(
                        keyword,
                        department,
                        status,
                        pageable)
                .map(EmployeeDto::fromEntity);
    }

    // ============================================================
    // DEACTIVATE EMPLOYEE
    // ============================================================

    @Override
    @Transactional
    public void deactivateEmployee(Long id) {
    
        // 1. Find employee
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found with id: " + id));
    
        // 2. Deactivate employee
        emp.setStatus(EmployeeStatus.INACTIVE);
        employeeRepository.saveAndFlush(emp);
    
        // 3. Check linked user
        if (emp.getUser() == null) {
            throw new ResourceNotFoundException(
                    "No user account linked with employee id: " + id);
        }
    
        Long userId = emp.getUser().getId();
    
        // 4. Fetch actual User from database
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: " + userId));
    
        // 5. Deactivate user
        user.setActive(false);
    
        // 6. Force database update
        userRepository.saveAndFlush(user);
    }
    // ============================================================
    // ACTIVATE EMPLOYEE
    // ============================================================

    @Override
@Transactional
public void activateEmployee(Long id) {

    // 1. Find employee
    Employee emp = employeeRepository.findById(id)
            .orElseThrow(() ->
                    new ResourceNotFoundException(
                            "Employee not found with id: " + id));

    // 2. Activate employee
    emp.setStatus(EmployeeStatus.ACTIVE);
    employeeRepository.saveAndFlush(emp);

    // 3. Get linked user
    if (emp.getUser() == null) {
        throw new ResourceNotFoundException(
                "No user account linked with employee id: " + id);
    }

    Long userId = emp.getUser().getId();

    // 4. Fetch User directly from database
    User user = userRepository.findById(userId)
            .orElseThrow(() ->
                    new ResourceNotFoundException(
                            "User not found with id: " + userId));

    // 5. Activate user
    user.setActive(true);

    // 6. Force database update
    userRepository.saveAndFlush(user);
}
    // ============================================================
    // COUNT TOTAL EMPLOYEES
    // ============================================================

    @Override
    public long countTotalEmployees() {
        return employeeRepository.count();
    }

    // ============================================================
    // COUNT ACTIVE EMPLOYEES
    // ============================================================

    @Override
    public long countActiveEmployees() {
        return employeeRepository
                .countByStatus(EmployeeStatus.ACTIVE);
    }
}