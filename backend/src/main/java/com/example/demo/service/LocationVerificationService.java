package com.example.demo.service;

import org.springframework.stereotype.Service;

import com.example.demo.dto.LocationVerificationRequest;
import com.example.demo.dto.LocationVerificationResponse;
import com.example.demo.exception.LocationVerificationException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.OfficeLocation;
import com.example.demo.repository.OfficeLocationRepository;

@Service
public class LocationVerificationService {

    private final OfficeLocationRepository officeLocationRepository;

    public LocationVerificationService(OfficeLocationRepository officeLocationRepository) {
        this.officeLocationRepository = officeLocationRepository;
    }

    /**
     * Calculate distance between two coordinates in meters using the Haversine formula.
     */
    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS_METERS = 6371000;

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_METERS * c;
    }

    /**
     * Verifies if employee location is inside the active office geofence.
     */
    public LocationVerificationResponse verifyLocation(LocationVerificationRequest request) {
        OfficeLocation office = officeLocationRepository.findFirstByActiveTrueOrderByIdAsc()
                .orElseThrow(() -> new ResourceNotFoundException("No active office location configured"));

        double distance = calculateDistance(
                request.getLatitude(),
                request.getLongitude(),
                office.getLatitude(),
                office.getLongitude()
        );

        // Round to 1 decimal place
        double roundedDistance = Math.round(distance * 10.0) / 10.0;
        boolean verified = roundedDistance <= office.getAllowedRadiusMeters();

        String message = verified
                ? String.format("Location verified. You are %.1fm from %s (Allowed: %.0fm)",
                    roundedDistance, office.getOfficeName(), office.getAllowedRadiusMeters())
                : String.format("Location verification failed. You are %.1fm away from %s, which exceeds the allowed radius of %.0fm",
                    roundedDistance, office.getOfficeName(), office.getAllowedRadiusMeters());

        return new LocationVerificationResponse(
                verified,
                roundedDistance,
                office.getAllowedRadiusMeters(),
                office.getOfficeName(),
                message
        );
    }

    public void validateLocationOrThrow(Double latitude, Double longitude) {
        if (latitude == null || longitude == null) {
            throw new LocationVerificationException("Latitude and longitude must be provided");
        }
        LocationVerificationResponse response = verifyLocation(new LocationVerificationRequest(latitude, longitude));
        if (!response.isVerified()) {
            throw new LocationVerificationException(response.getMessage());
        }
    }
}
