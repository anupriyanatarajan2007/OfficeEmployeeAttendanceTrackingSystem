package com.example.demo.service.impl;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.model.AttendanceAnomaly;
import com.example.demo.model.AttendanceRecord;
import com.example.demo.repository.AttendanceAnomalyRepository;
import com.example.demo.repository.AttendanceRecordRepository;
import com.example.demo.service.ReportService;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

@Service
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private static final Logger logger = LoggerFactory.getLogger(ReportServiceImpl.class);

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceAnomalyRepository attendanceAnomalyRepository;

    public ReportServiceImpl(AttendanceRecordRepository attendanceRecordRepository,
                             AttendanceAnomalyRepository attendanceAnomalyRepository) {
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.attendanceAnomalyRepository = attendanceAnomalyRepository;
    }

    @Override
    public List<Map<String, Object>> generateReportPreview(String reportType, LocalDate startDate, LocalDate endDate, String employeeCode, String department) {
        LocalDate start = (startDate != null) ? startDate : LocalDate.now().minusDays(30);
        LocalDate end = (endDate != null) ? endDate : LocalDate.now();

        if ("ANOMALIES".equalsIgnoreCase(reportType)) {
            List<AttendanceAnomaly> anomalies = attendanceAnomalyRepository.findAll();
            return anomalies.stream()
                    .filter(a -> employeeCode == null || employeeCode.isBlank() || (a.getEmployee() != null && employeeCode.equalsIgnoreCase(a.getEmployee().getEmpCode())))
                    .map(a -> {
                        Map<String, Object> map = new LinkedHashMap<>();
                        map.put("AnomalyId", a.getId());
                        map.put("EmployeeCode", a.getEmployee() != null ? a.getEmployee().getEmpCode() : "N/A");
                        map.put("EmployeeName", a.getEmployee() != null ? a.getEmployee().getName() : "N/A");
                        map.put("Severity", a.getSeverity() != null ? a.getSeverity().name() : "MEDIUM");
                        map.put("Description", a.getDescription());
                        map.put("DetectedAt", a.getDetectedAt() != null ? a.getDetectedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) : "N/A");
                        map.put("Resolved", a.isResolved() ? "YES" : "NO");
                        return map;
                    })
                    .collect(Collectors.toList());
        }

        List<AttendanceRecord> records = attendanceRecordRepository.findByDateBetween(start, end);

        return records.stream()
                .filter(r -> employeeCode == null || employeeCode.isBlank() || (r.getEmployeeCode() != null && employeeCode.equalsIgnoreCase(r.getEmployeeCode())))
                .filter(r -> department == null || department.isBlank() || (r.getEmployee() != null && department.equalsIgnoreCase(r.getEmployee().getDepartment())))
                .filter(r -> {
                    if ("ABSENTEES".equalsIgnoreCase(reportType)) {
                        return "ABSENT".equalsIgnoreCase(r.getStatus());
                    } else if ("LATE_ARRIVALS".equalsIgnoreCase(reportType)) {
                        return r.getLateMinutes() != null && r.getLateMinutes() > 0;
                    } else if ("OVERTIME".equalsIgnoreCase(reportType)) {
                        return r.getOvertimeMinutes() != null && r.getOvertimeMinutes() > 0;
                    }
                    return true;
                })
                .map(r -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("Date", r.getDate().toString());
                    map.put("EmployeeCode", r.getEmployeeCode());
                    map.put("EmployeeName", r.getEmployee() != null ? r.getEmployee().getName() : "N/A");
                    map.put("Department", r.getEmployee() != null ? r.getEmployee().getDepartment() : "N/A");
                    map.put("Status", r.getStatus());
                    map.put("CheckInTime", r.getCheckInTime() != null ? r.getCheckInTime().toString() : "--:--");
                    map.put("CheckOutTime", r.getCheckOutTime() != null ? r.getCheckOutTime().toString() : "--:--");
                    map.put("WorkingMinutes", r.getWorkingMinutes() != null ? r.getWorkingMinutes() : 0);
                    map.put("LateMinutes", r.getLateMinutes() != null ? r.getLateMinutes() : 0);
                    map.put("OvertimeMinutes", r.getOvertimeMinutes() != null ? r.getOvertimeMinutes() : 0);
                    return map;
                })
                .collect(Collectors.toList());
    }

    @Override
    public byte[] generateExcelReport(String reportType, LocalDate startDate, LocalDate endDate, String employeeCode, String department) {
        List<Map<String, Object>> data = generateReportPreview(reportType, startDate, endDate, employeeCode, department);

        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Attendance Report");

            // Header Style
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            font.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(font);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            if (!data.isEmpty()) {
                List<String> headers = new ArrayList<>(data.get(0).keySet());
                Row headerRow = sheet.createRow(0);
                for (int i = 0; i < headers.size(); i++) {
                    Cell cell = headerRow.createCell(i);
                    cell.setCellValue(headers.get(i));
                    cell.setCellStyle(headerStyle);
                }

                int rowIdx = 1;
                for (Map<String, Object> rowData : data) {
                    Row row = sheet.createRow(rowIdx++);
                    for (int i = 0; i < headers.size(); i++) {
                        Object val = rowData.get(headers.get(i));
                        Cell cell = row.createCell(i);
                        if (val instanceof Number) {
                            cell.setCellValue(((Number) val).doubleValue());
                        } else {
                            cell.setCellValue(val != null ? val.toString() : "");
                        }
                    }
                }

                for (int i = 0; i < headers.size(); i++) {
                    sheet.autoSizeColumn(i);
                }
            } else {
                Row row = sheet.createRow(0);
                row.createCell(0).setCellValue("No records found for specified criteria.");
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            logger.error("Error generating Excel report: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate Excel report: " + e.getMessage());
        }
    }

    @Override
    public byte[] generatePdfReport(String reportType, LocalDate startDate, LocalDate endDate, String employeeCode, String department) {
        List<Map<String, Object>> data = generateReportPreview(reportType, startDate, endDate, employeeCode, department);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(document, out);
            document.open();

            // Title
            com.lowagie.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Paragraph title = new Paragraph("AttendFlow - " + reportType.toUpperCase() + " ATTENDANCE REPORT", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(15);
            document.add(title);

            if (!data.isEmpty()) {
                List<String> headers = new ArrayList<>(data.get(0).keySet());
                PdfPTable table = new PdfPTable(headers.size());
                table.setWidthPercentage(100);

                com.lowagie.text.Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, java.awt.Color.WHITE);
                for (String header : headers) {
                    PdfPCell hcell = new PdfPCell(new Phrase(header, headFont));
                    hcell.setBackgroundColor(new java.awt.Color(30, 41, 59));
                    hcell.setPadding(6);
                    table.addCell(hcell);
                }

                com.lowagie.text.Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 9);
                for (Map<String, Object> row : data) {
                    for (String header : headers) {
                        Object val = row.get(header);
                        PdfPCell dcell = new PdfPCell(new Phrase(val != null ? val.toString() : "", dataFont));
                        dcell.setPadding(5);
                        table.addCell(dcell);
                    }
                }

                document.add(table);
            } else {
                document.add(new Paragraph("No records found for the specified criteria."));
            }

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            logger.error("Error generating PDF report: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate PDF report: " + e.getMessage());
        }
    }
}
