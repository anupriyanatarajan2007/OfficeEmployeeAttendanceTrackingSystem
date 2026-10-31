package com.example.demo.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface ReportService {
    List<Map<String, Object>> generateReportPreview(String reportType, LocalDate startDate, LocalDate endDate, String employeeCode, String department);
    byte[] generateExcelReport(String reportType, LocalDate startDate, LocalDate endDate, String employeeCode, String department);
    byte[] generatePdfReport(String reportType, LocalDate startDate, LocalDate endDate, String employeeCode, String department);
}
