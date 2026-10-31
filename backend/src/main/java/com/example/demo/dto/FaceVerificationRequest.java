package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;

public class FaceVerificationRequest {
    @NotBlank(message = "Captured face image or descriptor data is required")
    private String faceData; // Base64 image or landmark vector descriptor string

    public FaceVerificationRequest() {}

    public FaceVerificationRequest(String faceData) {
        this.faceData = faceData;
    }

    public String getFaceData() { return faceData; }
    public void setFaceData(String faceData) { this.faceData = faceData; }
}
