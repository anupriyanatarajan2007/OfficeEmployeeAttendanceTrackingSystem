package com.example.demo.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.OfficeLocation;
import com.example.demo.repository.OfficeLocationRepository;
import com.example.demo.service.OfficeLocationService;

@Service
public class OfficeLocationServiceImpl implements OfficeLocationService {

    private final OfficeLocationRepository repo;

    public OfficeLocationServiceImpl(OfficeLocationRepository repo) {
        this.repo = repo;
    }

    @Override
    @Transactional
    public OfficeLocation create(OfficeLocation location) {
        // If this new location is active, set it as active
        return repo.save(location);
    }

    @Override
    @Transactional
    public OfficeLocation update(Long id, OfficeLocation updated) {
        OfficeLocation existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Office location not found with id: " + id));

        existing.setOfficeName(updated.getOfficeName());
        existing.setLatitude(updated.getLatitude());
        existing.setLongitude(updated.getLongitude());
        existing.setAllowedRadiusMeters(updated.getAllowedRadiusMeters());
        existing.setActive(updated.isActive());

        return repo.save(existing);
    }

    @Override
    public OfficeLocation getById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Office location not found with id: " + id));
    }

    @Override
    public OfficeLocation getActiveOffice() {
        return repo.findFirstByActiveTrueOrderByIdAsc()
                .orElseGet(() -> repo.save(new OfficeLocation("Headquarters Office", 12.9716, 77.5946, 100.0)));
    }

    @Override
    public List<OfficeLocation> getAll() {
        return repo.findAll();
    }

    @Override
    @Transactional
    public void delete(Long id) {
        OfficeLocation existing = getById(id);
        existing.setActive(false);
        repo.save(existing);
    }
}
