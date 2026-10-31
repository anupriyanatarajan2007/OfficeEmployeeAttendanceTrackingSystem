package com.example.demo.service.impl;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Collections;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.demo.dto.ActiveQrDto;
import com.example.demo.dto.QrVerificationResponse;
import com.example.demo.exception.InvalidQrException;
import com.example.demo.model.OfficeLocation;
import com.example.demo.repository.OfficeLocationRepository;
import com.example.demo.service.DynamicQrService;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

@Service
public class DynamicQrServiceImpl implements DynamicQrService {

    private static final Logger logger = LoggerFactory.getLogger(DynamicQrServiceImpl.class);
    private static final SecureRandom RANDOM = new SecureRandom();

    @Value("${app.qr.secret:70337336763979244226452948404D635166546A576E5A723475377821412544404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}")
    private String qrSecret;

    @Value("${app.qr.expiration-seconds:45}")
    private int expirationSeconds;

    private final OfficeLocationRepository officeLocationRepository;

    // Cache of used nonces to prevent replay attacks
    private final Set<String> usedNonces = Collections.newSetFromMap(new ConcurrentHashMap<>());

    public DynamicQrServiceImpl(OfficeLocationRepository officeLocationRepository) {
        this.officeLocationRepository = officeLocationRepository;
    }

    @Override
    public ActiveQrDto getActiveQr() {
        OfficeLocation office = officeLocationRepository.findFirstByActiveTrueOrderByIdAsc()
                .orElseGet(() -> new OfficeLocation("Headquarters Office", 12.9716, 77.5946, 100.0));

        long now = Instant.now().getEpochSecond();
        // Snap to window boundary so all requests within the expiration window see consistent token
        long windowStart = (now / expirationSeconds) * expirationSeconds;
        long expiryTime = windowStart + expirationSeconds;
        int remainingSeconds = (int) (expiryTime - now);

        // Deterministic nonce for window + random salt
        byte[] salt = new byte[8];
        RANDOM.nextBytes(salt);
        String nonce = Base64.getUrlEncoder().withoutPadding().encodeToString(salt);

        // Format: officeId:windowStart:expiryTime:nonce
        String payload = String.format("%d:%d:%d:%s",
                office.getId() != null ? office.getId() : 1L,
                windowStart,
                expiryTime,
                nonce
        );

        String signature = computeHmac(payload);
        String fullToken = payload + ":" + signature;

        String qrImageBase64 = generateQrImageBase64(fullToken, 300, 300);

        return new ActiveQrDto(
                fullToken,
                qrImageBase64,
                remainingSeconds,
                now,
                office.getOfficeName()
        );
    }

    @Override
    public QrVerificationResponse verifyQr(String qrToken) {
        if (qrToken == null || qrToken.trim().isEmpty()) {
            throw new InvalidQrException("QR token cannot be empty");
        }

        String[] parts = qrToken.trim().split(":");
        if (parts.length != 5) {
            throw new InvalidQrException("Malformed QR token format");
        }

        String officeIdStr = parts[0];
        String windowStartStr = parts[1];
        String expiryStr = parts[2];
        String nonce = parts[3];
        String signature = parts[4];

        String payload = String.format("%s:%s:%s:%s", officeIdStr, windowStartStr, expiryStr, nonce);
        String expectedSignature = computeHmac(payload);

        if (!expectedSignature.equals(signature)) {
            logger.warn("QR verification failed: Invalid cryptographic signature");
            throw new InvalidQrException("Invalid QR signature: token has been tampered with");
        }

        long expiryTime;
        try {
            expiryTime = Long.parseLong(expiryStr);
        } catch (NumberFormatException e) {
            throw new InvalidQrException("Invalid expiration timestamp in QR token");
        }

        long now = Instant.now().getEpochSecond();
        // Allow a 15-second grace window for slow camera capture or network latency
        if (now > expiryTime + 15) {
            logger.warn("QR verification failed: Token expired at {}, current time {}", expiryTime, now);
            throw new InvalidQrException("Office QR code has expired. Please scan the current live QR code.");
        }

        // Check replay attack via nonce
        if (!usedNonces.add(nonce)) {
            logger.warn("QR verification failed: Replay attack detected with nonce {}", nonce);
            throw new InvalidQrException("QR token has already been used. Please scan a fresh QR code.");
        }

        // Prune older nonces if cache grows large
        if (usedNonces.size() > 5000) {
            usedNonces.clear();
        }

        String officeName = "Office";
        try {
            Long officeId = Long.parseLong(officeIdStr);
            officeName = officeLocationRepository.findById(officeId)
                    .map(OfficeLocation::getOfficeName)
                    .orElse("Office");
        } catch (Exception ignored) {}

        return new QrVerificationResponse(true, officeName, "Dynamic QR code verified successfully");
    }

    @Override
    public void validateQrOrThrow(String qrToken) {
        verifyQr(qrToken);
    }

    private String computeHmac(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(qrSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hmacBytes);
        } catch (Exception e) {
            throw new RuntimeException("Error computing HMAC signature", e);
        }
    }

    private String generateQrImageBase64(String text, int width, int height) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            byte[] imageBytes = outputStream.toByteArray();

            return "data:image/png;base64," + Base64.getEncoder().encodeToString(imageBytes);
        } catch (Exception e) {
            logger.error("Error generating QR code image", e);
            return "";
        }
    }
}
