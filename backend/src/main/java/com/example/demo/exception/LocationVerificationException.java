package com.example.demo.exception;

public class LocationVerificationException extends RuntimeException {
    public LocationVerificationException(String message) {
        super(message);
    }
}
