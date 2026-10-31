package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;

public class QrVerificationRequest {
    @NotBlank(message = "QR token is required")
    private String qrToken;

    public QrVerificationRequest() {}

    public QrVerificationRequest(String qrToken) {
        this.qrToken = qrToken;
    }

    public String getQrToken() { return qrToken; }
    public void setQrToken(String qrToken) { this.qrToken = qrToken; }
}
