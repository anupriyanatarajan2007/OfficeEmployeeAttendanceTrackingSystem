package com.example.demo.service;

import java.util.List;

import com.example.demo.model.OfficeLocation;

public interface OfficeLocationService {
    OfficeLocation create(OfficeLocation location);
    OfficeLocation update(Long id, OfficeLocation location);
    OfficeLocation getById(Long id);
    OfficeLocation getActiveOffice();
    List<OfficeLocation> getAll();
    void delete(Long id);
}
