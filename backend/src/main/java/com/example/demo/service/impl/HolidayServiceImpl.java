package com.example.demo.service.impl;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.exception.DuplicateResourceException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Holiday;
import com.example.demo.repository.HolidayRepository;
import com.example.demo.service.HolidayService;

@Service
public class HolidayServiceImpl implements HolidayService {

    private final HolidayRepository repo;

    public HolidayServiceImpl(HolidayRepository repo) {
        this.repo = repo;
    }

    @Override
    @Transactional
    public Holiday create(Holiday holiday) {
        if (repo.existsByHolidayDate(holiday.getHolidayDate())) {
            throw new DuplicateResourceException("Holiday already exists on date: " + holiday.getHolidayDate());
        }
        return repo.save(holiday);
    }

    @Override
    @Transactional
    public Holiday update(Long id, Holiday updated) {
        Holiday existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Holiday not found with id: " + id));

        if (!existing.getHolidayDate().equals(updated.getHolidayDate()) &&
                repo.existsByHolidayDate(updated.getHolidayDate())) {
            throw new DuplicateResourceException("Holiday already exists on date: " + updated.getHolidayDate());
        }

        existing.setHolidayName(updated.getHolidayName());
        existing.setHolidayDate(updated.getHolidayDate());
        existing.setDescription(updated.getDescription());
        existing.setActive(updated.isActive());

        return repo.save(existing);
    }

    @Override
    public Holiday getById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Holiday not found with id: " + id));
    }

    @Override
    public List<Holiday> getAll() {
        return repo.findByActiveTrueOrderByHolidayDateAsc();
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Holiday existing = getById(id);
        existing.setActive(false);
        repo.save(existing);
    }

    @Override
    public boolean isHoliday(LocalDate date) {
        return repo.findByHolidayDateAndActiveTrue(date).isPresent();
    }
}
