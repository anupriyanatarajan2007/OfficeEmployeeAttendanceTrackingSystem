package com.example.demo.service;

import com.example.demo.dto.ActiveQrDto;
import com.example.demo.dto.QrVerificationResponse;

public interface DynamicQrService {
    ActiveQrDto getActiveQr();
    QrVerificationResponse verifyQr(String qrToken);
    void validateQrOrThrow(String qrToken);
}
