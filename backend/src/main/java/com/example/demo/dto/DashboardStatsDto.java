package com.example.demo.dto;

import java.util.List;
import java.util.Map;

public class DashboardStatsDto {
    private long totalEmployees;
    private long activeEmployees;
    private long presentToday;
    private long absentToday;
    private long lateToday;
    private long onLeaveToday;
    private double attendancePercentage;
    private long suspiciousAttemptsCount;

    private List<Map<String, Object>> departmentAttendance;
    private List<Map<String, Object>> weeklyAttendance;
    private List<Map<String, Object>> monthlyAttendanceTrend;

    public DashboardStatsDto() {}

    public long getTotalEmployees() { return totalEmployees; }
    public void setTotalEmployees(long totalEmployees) { this.totalEmployees = totalEmployees; }

    public long getActiveEmployees() { return activeEmployees; }
    public void setActiveEmployees(long activeEmployees) { this.activeEmployees = activeEmployees; }

    public long getPresentToday() { return presentToday; }
    public void setPresentToday(long presentToday) { this.presentToday = presentToday; }

    public long getAbsentToday() { return absentToday; }
    public void setAbsentToday(long absentToday) { this.absentToday = absentToday; }

    public long getLateToday() { return lateToday; }
    public void setLateToday(long lateToday) { this.lateToday = lateToday; }

    public long getOnLeaveToday() { return onLeaveToday; }
    public void setOnLeaveToday(long onLeaveToday) { this.onLeaveToday = onLeaveToday; }

    public double getAttendancePercentage() { return attendancePercentage; }
    public void setAttendancePercentage(double attendancePercentage) { this.attendancePercentage = attendancePercentage; }

    public long getSuspiciousAttemptsCount() { return suspiciousAttemptsCount; }
    public void setSuspiciousAttemptsCount(long suspiciousAttemptsCount) { this.suspiciousAttemptsCount = suspiciousAttemptsCount; }

    public List<Map<String, Object>> getDepartmentAttendance() { return departmentAttendance; }
    public void setDepartmentAttendance(List<Map<String, Object>> departmentAttendance) { this.departmentAttendance = departmentAttendance; }

    public List<Map<String, Object>> getWeeklyAttendance() { return weeklyAttendance; }
    public void setWeeklyAttendance(List<Map<String, Object>> weeklyAttendance) { this.weeklyAttendance = weeklyAttendance; }

    public List<Map<String, Object>> getMonthlyAttendanceTrend() { return monthlyAttendanceTrend; }
    public void setMonthlyAttendanceTrend(List<Map<String, Object>> monthlyAttendanceTrend) { this.monthlyAttendanceTrend = monthlyAttendanceTrend; }
}
