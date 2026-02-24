package com.carbon.carbon.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${spring.mail.username:noreply@carboncalc.com}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        String resetUrl = frontendUrl + "/reset-password?token=" + resetToken;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("CarbonCalc - Password Reset Request");
        message.setText(
                "Hello,\n\n" +
                "You requested a password reset for your CarbonCalc account.\n\n" +
                "Click the link below to reset your password:\n" +
                resetUrl + "\n\n" +
                "This link will expire in 30 minutes.\n\n" +
                "If you did not request this, please ignore this email.\n\n" +
                "- CarbonCalc Team"
        );

        mailSender.send(message);
    }
}
