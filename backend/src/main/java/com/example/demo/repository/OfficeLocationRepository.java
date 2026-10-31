package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.OfficeLocation;

@Repository
public interface OfficeLocationRepository extends JpaRepository<OfficeLocation, Long> {
    Optional<OfficeLocation> findFirstByActiveTrueOrderByIdAsc();
    List<OfficeLocation> findByActiveTrue();
}
