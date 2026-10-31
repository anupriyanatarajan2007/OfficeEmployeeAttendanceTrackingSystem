package com.example.demo.dto;

public class LocationVerificationResponse {
    private boolean verified;
    private double distanceFromOfficeMeters;
    private double allowedRadiusMeters;
    private String officeName;
    private String message;

    public LocationVerificationResponse() {}

    public LocationVerificationResponse(boolean verified, double distanceFromOfficeMeters, double allowedRadiusMeters, String officeName, String message) {
        this.verified = verified;
        this.distanceFromOfficeMeters = distanceFromOfficeMeters;
        this.allowedRadiusMeters = allowedRadiusMeters;
        this.officeName = officeName;
        this.message = message;
    }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public double getDistanceFromOfficeMeters() { return distanceFromOfficeMeters; }
    public void setDistanceFromOfficeMeters(double distanceFromOfficeMeters) { this.distanceFromOfficeMeters = distanceFromOfficeMeters; }

    public double getAllowedRadiusMeters() { return allowedRadiusMeters; }
    public void setAllowedRadiusMeters(double allowedRadiusMeters) { this.allowedRadiusMeters = allowedRadiusMeters; }

    public String getOfficeName() { return officeName; }
    public void setOfficeName(String officeName) { this.officeName = officeName; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
