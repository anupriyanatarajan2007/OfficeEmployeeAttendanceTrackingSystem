package com.example.demo.scheduler;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.model.AttendanceRecord;
import com.example.demo.model.AttendanceStatus;
import com.example.demo.model.DailyAttendanceSummary;
import com.example.demo.model.Employee;
import com.example.demo.model.EmployeeStatus;
import com.example.demo.model.NotificationType;
import com.example.demo.repository.AttendanceRecordRepository;
import com.example.demo.repository.DailyAttendanceSummaryRepository;
import com.example.demo.repository.EmployeeRepository;
import com.example.demo.service.HolidayService;
import com.example.demo.service.LeaveService;
import com.example.demo.service.NotificationService;

@Component
public class AttendanceScheduler {

    private static final Logger logger = LoggerFactory.getLogger(AttendanceScheduler.class);

    @Value("${attendance.absent-cutoff.enabled:true}")
    private boolean enabled;

    private final EmployeeRepository employeeRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final DailyAttendanceSummaryRepository dailySummaryRepository;
    private final HolidayService holidayService;
    private final LeaveService leaveService;
    private final NotificationService notificationService;

    public AttendanceScheduler(EmployeeRepository employeeRepository,
                               AttendanceRecordRepository attendanceRecordRepository,
                               DailyAttendanceSummaryRepository dailySummaryRepository,
                               HolidayService holidayService,
                               LeaveService leaveService,
                               NotificationService notificationService) {
        this.employeeRepository = employeeRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.dailySummaryRepository = dailySummaryRepository;
        this.holidayService = holidayService;
        this.leaveService = leaveService;
        this.notificationService = notificationService;
    }

    /**
     * Executes absent detection cutoff job.
     * By default runs at 2:00 PM (14:00) on weekdays, configurable via cron.
     */
    @Scheduled(cron = "${attendance.absent-cutoff.cron:0 0 14 * * ?}")
    @Transactional
    public void processDailyAbsentDetection() {
        if (!enabled) {
            logger.info("Automatic absent detection is disabled by configuration");
            return;
        }

        LocalDate today = LocalDate.now();
        DayOfWeek dow = today.getDayOfWeek();

        // Skip weekly off (Saturday and Sunday)
        if (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) {
            logger.info("Skipping absent detection for weekend: {}", dow);
            return;
        }

        // Skip approved Holidays
        if (holidayService.isHoliday(today)) {
            logger.info("Skipping absent detection: Today is a registered holiday ({})", today);
            return;
        }

        logger.info("Starting automatic absent detection cutoff for date: {}", today);

        List<Employee> activeEmployees = employeeRepository.findByStatus(EmployeeStatus.ACTIVE);
        int markedAbsentCount = 0;

        for (Employee emp : activeEmployees) {
            // Check if already checked in or attendance record exists
            if (attendanceRecordRepository.findByEmployeeCodeAndDate(emp.getEmpCode(), today).isPresent()) {
                continue;
            }

            // Check if on approved leave
            if (leaveService.isEmployeeOnApprovedLeave(emp.getEmpCode(), today)) {
                // Record LEAVE in attendance
                AttendanceRecord leaveRecord = new AttendanceRecord();
                leaveRecord.setEmployee(emp);
                leaveRecord.setEmployeeCode(emp.getEmpCode());
                leaveRecord.setDate(today);
                leaveRecord.setStatus(AttendanceStatus.LEAVE.name());
                leaveRecord.setShiftName(emp.getAssignedShift() != null ? emp.getAssignedShift().getShiftName() : "General Shift");
                attendanceRecordRepository.save(leaveRecord);
                continue;
            }

            // Mark as ABSENT
            AttendanceRecord absentRecord = new AttendanceRecord();
            absentRecord.setEmployee(emp);
            absentRecord.setEmployeeCode(emp.getEmpCode());
            absentRecord.setDate(today);
            absentRecord.setStatus(AttendanceStatus.ABSENT.name());
            absentRecord.setShiftName(emp.getAssignedShift() != null ? emp.getAssignedShift().getShiftName() : "General Shift");
            attendanceRecordRepository.save(absentRecord);

            // Update Daily Summary
            DailyAttendanceSummary summary = dailySummaryRepository.findByEmployeeCodeAndDate(emp.getEmpCode(), today)
                    .orElseGet(() -> new DailyAttendanceSummary(emp.getEmpCode(), today));
            summary.setAbsentDays(1);
            dailySummaryRepository.save(summary);

            // Send notification to employee
            if (emp.getUser() != null) {
                notificationService.sendNotification(
                        emp.getUser(),
                        "Marked Absent",
                        String.format("You have been marked ABSENT for today (%s) due to no recorded check-in past the cutoff time.", today),
                        NotificationType.ALERT
                );
            }

            markedAbsentCount++;
        }

        logger.info("Completed automatic absent cutoff. Marked {} employee(s) as ABSENT.", markedAbsentCount);
    }
}
