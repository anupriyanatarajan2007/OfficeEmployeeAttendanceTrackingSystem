package com.example.demo.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.dto.FaceEnrollmentRequest;
import com.example.demo.dto.FaceVerificationRequest;
import com.example.demo.dto.FaceVerificationResponse;
import com.example.demo.model.Employee;
import com.example.demo.repository.EmployeeRepository;
import com.example.demo.service.impl.FaceVerificationServiceImpl;

@ExtendWith(MockitoExtension.class)
class FaceVerificationTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private FaceVerificationServiceImpl faceVerificationService;

    private Employee employee;

    @BeforeEach
    void setUp() {
        employee = new Employee();
        employee.setId(10L);
        employee.setEmpCode("EMP001");
        employee.setName("John Doe");
        employee.setFaceEnrolled(false);
    }

    @Test
    void testEnrollFace_Successful() {
        when(employeeRepository.findById(10L)).thenReturn(Optional.of(employee));

        String testFaceData = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...";
        faceVerificationService.enrollFace(10L, new FaceEnrollmentRequest(testFaceData));

        assertTrue(employee.isFaceEnrolled());
        assertNotNull(employee.getFaceData());
        verify(employeeRepository).save(employee);
    }

    @Test
    void testVerifyFace_NotEnrolled_ReturnsNotEnrolledStatus() {
        when(employeeRepository.findOptionalByEmpCode("EMP001")).thenReturn(Optional.of(employee));

        FaceVerificationResponse response = faceVerificationService.verifyFace("EMP001", new FaceVerificationRequest("some-sample-face-data"));

        assertNotNull(response);
        assertFalse(response.isVerified());
        assertTrue(response.getMessage().contains("enroll face"));
    }

    @Test
    void testVerifyFace_EnrolledAndIdenticalMatch_Succeeds() {
        when(employeeRepository.findById(10L)).thenReturn(Optional.of(employee));
        String sampleFacePayload = "test-vector-representation-for-employee-face-embedding-001";
        faceVerificationService.enrollFace(10L, new FaceEnrollmentRequest(sampleFacePayload));

        when(employeeRepository.findOptionalByEmpCode("EMP001")).thenReturn(Optional.of(employee));
        FaceVerificationResponse response = faceVerificationService.verifyFace("EMP001", new FaceVerificationRequest(sampleFacePayload));

        assertNotNull(response);
        assertTrue(response.isVerified(), "Identical face input should result in successful verification");
        assertTrue(response.getConfidenceScore() >= 0.70);
    }
}
