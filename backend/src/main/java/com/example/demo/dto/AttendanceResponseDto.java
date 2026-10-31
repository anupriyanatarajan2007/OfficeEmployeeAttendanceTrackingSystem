package com.example.demo.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.example.demo.model.AttendanceRecord;

public class AttendanceResponseDto {
    private Long id;
    private String employeeCode;
    private String employeeName;
    private String department;
    private LocalDate date;
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private Integer workingMinutes;
    private Integer lateMinutes;
    private Integer earlyCheckoutMinutes;
    private Integer overtimeMinutes;
    private String shiftName;
    private boolean locationVerified;
    private boolean faceVerified;
    private boolean qrVerified;
    private String status;

    public AttendanceResponseDto() {}

    public static AttendanceResponseDto fromEntity(AttendanceRecord record) {
        AttendanceResponseDto dto = new AttendanceResponseDto();
        dto.setId(record.getId());
        dto.setEmployeeCode(record.getEmployeeCode());
        if (record.getEmployee() != null) {
            dto.setEmployeeName(record.getEmployee().getName());
            dto.setDepartment(record.getEmployee().getDepartment());
        }
        dto.setDate(record.getDate());
        dto.setCheckInTime(record.getCheckInTime());
        dto.setCheckOutTime(record.getCheckOutTime());
        dto.setWorkingMinutes(record.getWorkingMinutes());
        dto.setLateMinutes(record.getLateMinutes());
        dto.setEarlyCheckoutMinutes(record.getEarlyCheckoutMinutes());
        dto.setOvertimeMinutes(record.getOvertimeMinutes());
        dto.setShiftName(record.getShiftName());
        dto.setLocationVerified(record.isLocationVerified());
        dto.setFaceVerified(record.isFaceVerified());
        dto.setQrVerified(record.isQrVerified());
        dto.setStatus(record.getStatus());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmployeeCode() { return employeeCode; }
    public void setEmployeeCode(String employeeCode) { this.employeeCode = employeeCode; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public LocalTime getCheckInTime() { return checkInTime; }
    public void setCheckInTime(LocalTime checkInTime) { this.checkInTime = checkInTime; }

    public LocalTime getCheckOutTime() { return checkOutTime; }
    public void setCheckOutTime(LocalTime checkOutTime) { this.checkOutTime = checkOutTime; }

    public Integer getWorkingMinutes() { return workingMinutes; }
    public void setWorkingMinutes(Integer workingMinutes) { this.workingMinutes = workingMinutes; }

    public Integer getLateMinutes() { return lateMinutes; }
    public void setLateMinutes(Integer lateMinutes) { this.lateMinutes = lateMinutes; }

    public Integer getEarlyCheckoutMinutes() { return earlyCheckoutMinutes; }
    public void setEarlyCheckoutMinutes(Integer earlyCheckoutMinutes) { this.earlyCheckoutMinutes = earlyCheckoutMinutes; }

    public Integer getOvertimeMinutes() { return overtimeMinutes; }
    public void setOvertimeMinutes(Integer overtimeMinutes) { this.overtimeMinutes = overtimeMinutes; }

    public String getShiftName() { return shiftName; }
    public void setShiftName(String shiftName) { this.shiftName = shiftName; }

    public boolean isLocationVerified() { return locationVerified; }
    public void setLocationVerified(boolean locationVerified) { this.locationVerified = locationVerified; }

    public boolean isFaceVerified() { return faceVerified; }
    public void setFaceVerified(boolean faceVerified) { this.faceVerified = faceVerified; }

    public boolean isQrVerified() { return qrVerified; }
    public void setQrVerified(boolean qrVerified) { this.qrVerified = qrVerified; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
