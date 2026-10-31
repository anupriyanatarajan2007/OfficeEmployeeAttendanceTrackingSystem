package com.example.demo.service;

import com.example.demo.dto.FaceEnrollmentRequest;
import com.example.demo.dto.FaceVerificationRequest;
import com.example.demo.dto.FaceVerificationResponse;

public interface FaceVerificationService {
    void enrollFace(Long employeeId, FaceEnrollmentRequest request);
    FaceVerificationResponse verifyFace(String employeeCode, FaceVerificationRequest request);
    void validateFaceOrThrow(String employeeCode, String faceData);
}
