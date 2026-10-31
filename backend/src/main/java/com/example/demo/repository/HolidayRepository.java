package com.example.demo.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Holiday;

@Repository
public interface HolidayRepository extends JpaRepository<Holiday, Long> {
    Optional<Holiday> findByHolidayDateAndActiveTrue(LocalDate holidayDate);
    List<Holiday> findByActiveTrueOrderByHolidayDateAsc();
    List<Holiday> findByHolidayDateBetweenAndActiveTrue(LocalDate start, LocalDate end);
    boolean existsByHolidayDate(LocalDate holidayDate);
}
