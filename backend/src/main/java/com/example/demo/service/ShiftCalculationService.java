package com.example.demo.service;

import java.time.Duration;
import java.time.LocalTime;

import org.springframework.stereotype.Service;

import com.example.demo.model.Shift;

@Service
public class ShiftCalculationService {

    public static class ShiftComputationResult {
        private int lateMinutes;
        private int earlyCheckoutMinutes;
        private int workingMinutes;
        private int overtimeMinutes;

        public ShiftComputationResult(int lateMinutes, int earlyCheckoutMinutes, int workingMinutes, int overtimeMinutes) {
            this.lateMinutes = lateMinutes;
            this.earlyCheckoutMinutes = earlyCheckoutMinutes;
            this.workingMinutes = workingMinutes;
            this.overtimeMinutes = overtimeMinutes;
        }

        public int getLateMinutes() { return lateMinutes; }
        public int getEarlyCheckoutMinutes() { return earlyCheckoutMinutes; }
        public int getWorkingMinutes() { return workingMinutes; }
        public int getOvertimeMinutes() { return overtimeMinutes; }
    }

    /**
     * Computes late arrival minutes for check-in against assigned shift.
     */
    public int calculateLateMinutes(Shift shift, LocalTime checkInTime) {
        if (checkInTime == null) return 0;

        LocalTime shiftStart = shift != null ? shift.getStartTime() : LocalTime.of(9, 0);
        int gracePeriod = shift != null ? shift.getGracePeriodMinutes() : 15;

        LocalTime graceCutoff = shiftStart.plusMinutes(gracePeriod);

        if (checkInTime.isAfter(graceCutoff)) {
            long minutes = Duration.between(shiftStart, checkInTime).toMinutes();
            return (int) Math.max(0, minutes);
        }
        return 0;
    }

    /**
     * Computes working hours, early checkout, and overtime on check-out.
     */
    public ShiftComputationResult computeFullShiftMetrics(Shift shift, LocalTime checkInTime, LocalTime checkOutTime) {
        if (checkInTime == null || checkOutTime == null) {
            return new ShiftComputationResult(0, 0, 0, 0);
        }

        int lateMinutes = calculateLateMinutes(shift, checkInTime);

        LocalTime shiftStart = shift != null ? shift.getStartTime() : LocalTime.of(9, 0);
        LocalTime shiftEnd = shift != null ? shift.getEndTime() : LocalTime.of(18, 0);
        boolean isOvernight = shift != null && (shift.isOvernight() || shiftEnd.isBefore(shiftStart));
        int minWorkingMinutes = shift != null ? shift.getMinimumWorkingMinutes() : 480;

        // Total working minutes
        int workingMinutes;
        if (isOvernight && checkOutTime.isBefore(checkInTime)) {
            long toMidnight = Duration.between(checkInTime, LocalTime.MAX).toMinutes() + 1;
            long fromMidnight = Duration.between(LocalTime.MIN, checkOutTime).toMinutes();
            workingMinutes = (int) (toMidnight + fromMidnight);
        } else {
            workingMinutes = (int) Math.max(0, Duration.between(checkInTime, checkOutTime).toMinutes());
        }

        // Early checkout
        int earlyCheckoutMinutes = 0;
        if (isOvernight) {
            if (checkOutTime.isBefore(shiftEnd)) {
                earlyCheckoutMinutes = (int) Duration.between(checkOutTime, shiftEnd).toMinutes();
            }
        } else {
            if (checkOutTime.isBefore(shiftEnd)) {
                earlyCheckoutMinutes = (int) Duration.between(checkOutTime, shiftEnd).toMinutes();
            }
        }
        earlyCheckoutMinutes = Math.max(0, earlyCheckoutMinutes);

        // Overtime
        int overtimeMinutes = 0;
        if (isOvernight) {
            if (checkOutTime.isAfter(shiftEnd)) {
                overtimeMinutes = (int) Duration.between(shiftEnd, checkOutTime).toMinutes();
            }
        } else {
            if (checkOutTime.isAfter(shiftEnd)) {
                overtimeMinutes = (int) Duration.between(shiftEnd, checkOutTime).toMinutes();
            }
        }
        // Additional overtime if working minutes exceed required minimum
        if (workingMinutes > minWorkingMinutes) {
            int extra = workingMinutes - minWorkingMinutes;
            overtimeMinutes = Math.max(overtimeMinutes, extra);
        }

        return new ShiftComputationResult(lateMinutes, earlyCheckoutMinutes, workingMinutes, overtimeMinutes);
    }
}
