package com.example.demo.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.example.demo.model.Shift;

class ShiftCalculationTest {

    private ShiftCalculationService shiftCalculationService;
    private Shift standardShift;

    @BeforeEach
    void setUp() {
        shiftCalculationService = new ShiftCalculationService();

        // 09:00 to 18:00 with 15 minutes grace period
        standardShift = new Shift();
        standardShift.setShiftName("General Day Shift");
        standardShift.setStartTime(LocalTime.of(9, 0));
        standardShift.setEndTime(LocalTime.of(18, 0));
        standardShift.setGracePeriodMinutes(15);
        standardShift.setMinimumWorkingMinutes(480);
        standardShift.setOvernight(false);
    }

    @Test
    void testLateMinutes_OnTimeArrival_ReturnsZero() {
        LocalTime checkIn = LocalTime.of(8, 55);
        int lateMinutes = shiftCalculationService.calculateLateMinutes(standardShift, checkIn);
        assertEquals(0, lateMinutes);
    }

    @Test
    void testLateMinutes_WithinGracePeriod_ReturnsZero() {
        LocalTime checkIn = LocalTime.of(9, 14);
        int lateMinutes = shiftCalculationService.calculateLateMinutes(standardShift, checkIn);
        assertEquals(0, lateMinutes);
    }

    @Test
    void testLateMinutes_ExceedingGracePeriod_ReturnsMinutesFromStart() {
        LocalTime checkIn = LocalTime.of(9, 30);
        int lateMinutes = shiftCalculationService.calculateLateMinutes(standardShift, checkIn);
        assertEquals(30, lateMinutes, "Arrival at 9:30 for a 9:00 shift should be counted as 30 minutes late");
    }

    @Test
    void testComputeFullShiftMetrics_NormalDay() {
        LocalTime checkIn = LocalTime.of(9, 0);
        LocalTime checkOut = LocalTime.of(18, 0);

        ShiftCalculationService.ShiftComputationResult result =
                shiftCalculationService.computeFullShiftMetrics(standardShift, checkIn, checkOut);

        assertEquals(0, result.getLateMinutes());
        assertEquals(0, result.getEarlyCheckoutMinutes());
        assertEquals(540, result.getWorkingMinutes()); // 9 hours = 540 min
        assertEquals(60, result.getOvertimeMinutes());  // 540 - 480 min = 60 min overtime
    }

    @Test
    void testComputeFullShiftMetrics_EarlyCheckout() {
        LocalTime checkIn = LocalTime.of(9, 0);
        LocalTime checkOut = LocalTime.of(17, 0); // 1 hour early

        ShiftCalculationService.ShiftComputationResult result =
                shiftCalculationService.computeFullShiftMetrics(standardShift, checkIn, checkOut);

        assertEquals(60, result.getEarlyCheckoutMinutes());
        assertEquals(480, result.getWorkingMinutes());
        assertEquals(0, result.getOvertimeMinutes());
    }
}
