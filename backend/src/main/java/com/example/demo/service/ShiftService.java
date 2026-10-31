package com.example.demo.service;

import java.util.List;

import com.example.demo.model.Shift;

public interface ShiftService {
    Shift create(Shift shift);
    Shift update(Long id, Shift shift);
    Shift getById(Long id);
    List<Shift> getAll();
    List<Shift> getActive();
    void delete(Long id);
}
