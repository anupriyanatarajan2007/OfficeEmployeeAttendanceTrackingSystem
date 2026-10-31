package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Shift;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, Long> {
    List<Shift> findByActiveTrue();
    Optional<Shift> findFirstByActiveTrue();
    Optional<Shift> findByShiftName(String shiftName);
    boolean existsByShiftName(String shiftName);
}
