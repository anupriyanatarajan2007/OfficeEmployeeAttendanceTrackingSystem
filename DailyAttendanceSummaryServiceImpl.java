package com.example.demo.service;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.demo.model.DailyAttendanceSummary;
import com.example.demo.model.Employee;
import com.example.demo.repository.DailyAttendanceSummaryRepository;
import com.example.demo.repository.EmployeeRepository;

@Service
public class DailyAttendanceSummaryServiceImpl implements DailyAttendanceSummaryService {

    private final DailyAttendanceSummaryRepository repo;
    private final EmployeeRepository employeeRepo;

    public DailyAttendanceSummaryServiceImpl(DailyAttendanceSummaryRepository repo,
                                             EmployeeRepository employeeRepo) {
        this.repo = repo;
        this.employeeRepo = employeeRepo;
    }

    @Override
    public DailyAttendanceSummary create(DailyAttendanceSummary summary) {
        return repo.save(summary);
    }

      @Override
    public Page<DailyAttendanceSummary> getByEmployeeCodeAndDateRange(
            String empCode, LocalDate start, LocalDate end, Pageable pageable) {
        return repo.findByEmployeeCodeAndDateBetween(empCode, start, end, pageable);
    }
    
    @Override
    public Page<DailyAttendanceSummary> getByEmployeeId(Long employeeId, Pageable pageable) {
    return employeeRepo.findById(employeeId)
            .map(Employee::getEmpCode)
            .map(empCode -> repo.findByEmployeeCode(empCode, pageable))
            .orElse(Page.empty(pageable));  // safe fallback, no PageImpl needed
}



}
