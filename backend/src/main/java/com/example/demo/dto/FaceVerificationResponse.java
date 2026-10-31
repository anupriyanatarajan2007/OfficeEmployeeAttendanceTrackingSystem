package com.example.demo.dto;

public class FaceVerificationResponse {
    private boolean verified;
    private double confidenceScore;
    private String status; // MATCHED / MISMATCH / NO_FACE_ENROLLED / ERROR
    private String message;

    public FaceVerificationResponse() {}

    public FaceVerificationResponse(boolean verified, double confidenceScore, String status, String message) {
        this.verified = verified;
        this.confidenceScore = confidenceScore;
        this.status = status;
        this.message = message;
    }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(double confidenceScore) { this.confidenceScore = confidenceScore; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
