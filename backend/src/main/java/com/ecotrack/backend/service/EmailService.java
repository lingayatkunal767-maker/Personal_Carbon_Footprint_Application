package com.ecotrack.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOtp(String email, String otp) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("EcoTrack Email Verification 🌿");
        message.setText("Your OTP is: " + otp + "\nValid for 5 minutes.");

        mailSender.send(message);
    }

    public void sendResetOtp(String email, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("EcoTrack Password Reset Request 🔑");
        message.setText("We received a request to reset your password.\n\n" +
                "Your Reset OTP is: " + otp + "\n" +
                "This code is valid for 15 minutes.\n\n" +
                "If you did not request this, please ignore this email.");

        mailSender.send(message);
    }
}