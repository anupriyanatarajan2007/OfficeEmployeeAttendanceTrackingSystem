package com.example.demo.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import java.lang.reflect.Field;
import java.time.Instant;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.dto.ActiveQrDto;
import com.example.demo.dto.QrVerificationResponse;
import com.example.demo.exception.InvalidQrException;
import com.example.demo.model.OfficeLocation;
import com.example.demo.repository.OfficeLocationRepository;
import com.example.demo.service.impl.DynamicQrServiceImpl;

@ExtendWith(MockitoExtension.class)
class DynamicQrTest {

    @Mock
    private OfficeLocationRepository officeLocationRepository;

    @InjectMocks
    private DynamicQrServiceImpl dynamicQrService;

    private OfficeLocation officeLocation;

    @BeforeEach
    void setUp() throws Exception {
        officeLocation = new OfficeLocation("HQ", 12.9716, 77.5946, 100.0);
        officeLocation.setId(1L);

        // Inject default test secret & expiration
        Field secretField = DynamicQrServiceImpl.class.getDeclaredField("qrSecret");
        secretField.setAccessible(true);
        secretField.set(dynamicQrService, "test-secret-key-for-attendance-hmac-sha256-dynamic-qr-token-1234567890");

        Field expField = DynamicQrServiceImpl.class.getDeclaredField("expirationSeconds");
        expField.setAccessible(true);
        expField.set(dynamicQrService, 45);
    }

    @Test
    void testGetActiveQr_GeneratesValidTokenAndImage() {
        when(officeLocationRepository.findFirstByActiveTrueOrderByIdAsc()).thenReturn(Optional.of(officeLocation));

        ActiveQrDto qrDto = dynamicQrService.getActiveQr();

        assertNotNull(qrDto);
        assertNotNull(qrDto.getQrToken());
        assertNotNull(qrDto.getQrCodeImageBase64());
        assertTrue(qrDto.getExpiresInSeconds() > 0 && qrDto.getExpiresInSeconds() <= 45);
    }

    @Test
    void testVerifyQr_ValidCurrentToken_Passes() {
        when(officeLocationRepository.findFirstByActiveTrueOrderByIdAsc()).thenReturn(Optional.of(officeLocation));

        ActiveQrDto qrDto = dynamicQrService.getActiveQr();
        QrVerificationResponse response = dynamicQrService.verifyQr(qrDto.getQrToken());

        assertNotNull(response);
        assertTrue(response.isVerified(), "Freshly generated QR token should verify successfully");
    }

    @Test
    void testVerifyQr_TamperedSignature_ThrowsInvalidQrException() {
        when(officeLocationRepository.findFirstByActiveTrueOrderByIdAsc()).thenReturn(Optional.of(officeLocation));

        ActiveQrDto qrDto = dynamicQrService.getActiveQr();
        String tamperedToken = qrDto.getQrToken().substring(0, qrDto.getQrToken().length() - 4) + "XXXX";

        assertThrows(InvalidQrException.class, () -> dynamicQrService.verifyQr(tamperedToken),
                "Tampered signature should throw InvalidQrException");
    }

    @Test
    void testVerifyQr_ReplayAttack_ThrowsInvalidQrExceptionOnSecondUse() {
        when(officeLocationRepository.findFirstByActiveTrueOrderByIdAsc()).thenReturn(Optional.of(officeLocation));

        ActiveQrDto qrDto = dynamicQrService.getActiveQr();
        QrVerificationResponse firstResponse = dynamicQrService.verifyQr(qrDto.getQrToken());
        assertTrue(firstResponse.isVerified());

        // Replay same token
        assertThrows(InvalidQrException.class, () -> dynamicQrService.verifyQr(qrDto.getQrToken()),
                "Replaying the same nonce should throw InvalidQrException");
    }

    @Test
    void testVerifyQr_MalformedToken_ThrowsException() {
        assertThrows(InvalidQrException.class, () -> dynamicQrService.verifyQr("invalid-token-format"));
        assertThrows(InvalidQrException.class, () -> dynamicQrService.verifyQr(""));
    }
}
