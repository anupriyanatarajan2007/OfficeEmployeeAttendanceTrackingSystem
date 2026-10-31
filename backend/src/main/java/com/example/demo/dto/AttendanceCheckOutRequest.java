package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AttendanceCheckOutRequest {

    @NotNull(message = "Latitude is required for geofence verification")
    private Double latitude;

    @NotNull(message = "Longitude is required for geofence verification")
    private Double longitude;

    @NotBlank(message = "Face verification data is required")
    private String faceData;

    @NotBlank(message = "Dynamic QR token is required")
    private String qrToken;

    private String deviceInfo;
    private String ipAddress;

    public AttendanceCheckOutRequest() {}

    public AttendanceCheckOutRequest(Double latitude, Double longitude, String faceData, String qrToken) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.faceData = faceData;
        this.qrToken = qrToken;
    }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getFaceData() { return faceData; }
    public void setFaceData(String faceData) { this.faceData = faceData; }

    public String getQrToken() { return qrToken; }
    public void setQrToken(String qrToken) { this.qrToken = qrToken; }

    public String getDeviceInfo() { return deviceInfo; }
    public void setDeviceInfo(String deviceInfo) { this.deviceInfo = deviceInfo; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
}
