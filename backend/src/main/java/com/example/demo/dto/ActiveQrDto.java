package com.example.demo.dto;

public class ActiveQrDto {
    private String qrToken;
    private String qrCodeImageBase64;
    private int expiresInSeconds;
    private long timestamp;
    private String officeName;

    public ActiveQrDto() {}

    public ActiveQrDto(String qrToken, String qrCodeImageBase64, int expiresInSeconds, long timestamp, String officeName) {
        this.qrToken = qrToken;
        this.qrCodeImageBase64 = qrCodeImageBase64;
        this.expiresInSeconds = expiresInSeconds;
        this.timestamp = timestamp;
        this.officeName = officeName;
    }

    public String getQrToken() { return qrToken; }
    public void setQrToken(String qrToken) { this.qrToken = qrToken; }

    public String getQrCodeImageBase64() { return qrCodeImageBase64; }
    public void setQrCodeImageBase64(String qrCodeImageBase64) { this.qrCodeImageBase64 = qrCodeImageBase64; }

    public int getExpiresInSeconds() { return expiresInSeconds; }
    public void setExpiresInSeconds(int expiresInSeconds) { this.expiresInSeconds = expiresInSeconds; }

    public long getTimestamp() { return timestamp; }
    public void setTimestamp(long timestamp) { this.timestamp = timestamp; }

    public String getOfficeName() { return officeName; }
    public void setOfficeName(String officeName) { this.officeName = officeName; }
}
