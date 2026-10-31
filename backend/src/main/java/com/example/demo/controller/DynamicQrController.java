package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.ActiveQrDto;
import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.QrVerificationRequest;
import com.example.demo.dto.QrVerificationResponse;
import com.example.demo.service.DynamicQrService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/qr")
public class DynamicQrController {

    private final DynamicQrService dynamicQrService;

    public DynamicQrController(DynamicQrService dynamicQrService) {
        this.dynamicQrService = dynamicQrService;
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<ActiveQrDto>> getActiveQr() {
        ActiveQrDto qr = dynamicQrService.getActiveQr();
        return ResponseEntity.ok(ApiResponse.ok(qr));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<QrVerificationResponse>> verifyQr(@Valid @RequestBody QrVerificationRequest request) {
        QrVerificationResponse response = dynamicQrService.verifyQr(request.getQrToken());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
