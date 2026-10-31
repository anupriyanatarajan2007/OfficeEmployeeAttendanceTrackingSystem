package com.example.demo.service;

import java.time.LocalDate;
import java.util.List;

import com.example.demo.model.Holiday;

public interface HolidayService {
    Holiday create(Holiday holiday);
    Holiday update(Long id, Holiday holiday);
    Holiday getById(Long id);
    List<Holiday> getAll();
    void delete(Long id);
    boolean isHoliday(LocalDate date);
}
