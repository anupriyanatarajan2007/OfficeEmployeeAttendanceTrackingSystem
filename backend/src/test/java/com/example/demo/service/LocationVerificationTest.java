package com.example.demo.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.dto.LocationVerificationRequest;
import com.example.demo.dto.LocationVerificationResponse;
import com.example.demo.model.OfficeLocation;
import com.example.demo.repository.OfficeLocationRepository;

@ExtendWith(MockitoExtension.class)
class LocationVerificationTest {

    @Mock
    private OfficeLocationRepository officeLocationRepository;

    @InjectMocks
    private LocationVerificationService locationVerificationService;

    private OfficeLocation officeLocation;

    @BeforeEach
    void setUp() {
        // Tech Park Bangalore (12.9716, 77.5946, 150m radius)
        officeLocation = new OfficeLocation("Tech Park Bangalore", 12.9716, 77.5946, 150.0);
    }

    @Test
    void testCalculateDistance_ExactMatch_ReturnsZero() {
        double distance = locationVerificationService.calculateDistance(12.9716, 77.5946, 12.9716, 77.5946);
        assertTrue(distance < 0.1, "Distance between identical points should be essentially 0");
    }

    @Test
    void testVerifyLocation_WithinAllowedRadius_Succeeds() {
        when(officeLocationRepository.findFirstByActiveTrueOrderByIdAsc()).thenReturn(Optional.of(officeLocation));

        // Coordinate ~30 meters away
        LocationVerificationRequest request = new LocationVerificationRequest(12.9718, 77.5948);
        LocationVerificationResponse response = locationVerificationService.verifyLocation(request);

        assertNotNull(response);
        assertTrue(response.isVerified(), "Location within 150m should be verified");
        assertTrue(response.getDistanceFromOfficeMeters() <= 150.0);
    }

    @Test
    void testVerifyLocation_OutsideAllowedRadius_Fails() {
        when(officeLocationRepository.findFirstByActiveTrueOrderByIdAsc()).thenReturn(Optional.of(officeLocation));

        // Coordinate ~5 km away (12.9352, 77.6245)
        LocationVerificationRequest request = new LocationVerificationRequest(12.9352, 77.6245);
        LocationVerificationResponse response = locationVerificationService.verifyLocation(request);

        assertNotNull(response);
        assertFalse(response.isVerified(), "Location 5km away should fail verification");
        assertTrue(response.getDistanceFromOfficeMeters() > 150.0);
    }
}
