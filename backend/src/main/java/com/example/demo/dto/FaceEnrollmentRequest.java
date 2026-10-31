package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;

public class FaceEnrollmentRequest {
    @NotBlank(message = "Face enrollment image or descriptor data is required")
    private String faceData;

    public FaceEnrollmentRequest() {}

    public FaceEnrollmentRequest(String faceData) {
        this.faceData = faceData;
    }

    public String getFaceData() { return faceData; }
    public void setFaceData(String faceData) { this.faceData = faceData; }
}
