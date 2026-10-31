package com.example.demo.exception;

public class InvalidAttendanceOperationException extends RuntimeException {
    public InvalidAttendanceOperationException(String message) {
        super(message);
    }
}
