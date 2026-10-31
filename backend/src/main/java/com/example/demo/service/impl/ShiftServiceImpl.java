
package com.example.demo.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.exception.DuplicateResourceException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Shift;
import com.example.demo.repository.ShiftRepository;
import com.example.demo.service.ShiftService;

@Service
public class ShiftServiceImpl implements ShiftService {

    private final ShiftRepository repo;

    public ShiftServiceImpl(ShiftRepository repo) {
        this.repo = repo;
    }

    @Override
    @Transactional
    public Shift create(Shift shift) {

        if (repo.existsByShiftName(shift.getShiftName())) {
            throw new DuplicateResourceException(
                    "Shift already exists with name: " + shift.getShiftName()
            );
        }

        return repo.save(shift);
    }

    @Override
    @Transactional
    public Shift update(Long id, Shift updated) {

        Shift existing = repo.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Shift not found with id: " + id
                        )
                );

        // Check duplicate shift name
        if (!existing.getShiftName().equalsIgnoreCase(updated.getShiftName())
                && repo.existsByShiftName(updated.getShiftName())) {

            throw new DuplicateResourceException(
                    "Shift already exists with name: "
                            + updated.getShiftName()
            );
        }

        existing.setShiftName(updated.getShiftName());
        existing.setStartTime(updated.getStartTime());
        existing.setEndTime(updated.getEndTime());
        existing.setGracePeriodMinutes(
                updated.getGracePeriodMinutes()
        );
        existing.setMinimumWorkingMinutes(
                updated.getMinimumWorkingMinutes()
        );

        // Important
        existing.setOvernight(updated.isOvernight());

        existing.setActive(updated.isActive());

        return repo.save(existing);
    }

    @Override
    public Shift getById(Long id) {

        return repo.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Shift not found with id: " + id
                        )
                );
    }

    @Override
    public List<Shift> getAll() {
        return repo.findAll();
    }

    @Override
    public List<Shift> getActive() {
        return repo.findByActiveTrue();
    }

    @Override
    @Transactional
    public void delete(Long id) {

        Shift existing = getById(id);

        // REAL DELETE
        repo.delete(existing);
    }
}
