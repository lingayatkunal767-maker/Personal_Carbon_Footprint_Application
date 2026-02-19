package com.carbon.carbon.exception;

public class EmailConflictException extends RuntimeException {
    public EmailConflictException() {
        super("User already exists with this email.");
    }
}

