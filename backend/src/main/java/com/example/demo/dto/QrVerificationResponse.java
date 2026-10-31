package com.example.demo.dto;

public class QrVerificationResponse {
    private boolean verified;
    private String officeName;
    private String message;

    public QrVerificationResponse() {}

    public QrVerificationResponse(boolean verified, String officeName, String message) {
        this.verified = verified;
        this.officeName = officeName;
        this.message = message;
    }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public String getOfficeName() { return officeName; }
    public void setOfficeName(String officeName) { this.officeName = officeName; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
