package com.carbon.carbontracker.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.mail.from:}")
    private String fromEmail;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    /**
     * Sends OTP to the given email address. Returns true if sent successfully.
     * Only sends when the user exists in DB (caller checks that).
     */
    public boolean sendOtpEmail(String toEmail, String otp) {
        if (!mailEnabled || mailSender == null || fromEmail == null || fromEmail.isBlank()) {
            log.warn("Mail not configured or disabled. OTP will not be sent by email.");
            return false;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("CarbonCalc - Password reset OTP");
            message.setText(
                "Your password reset OTP is: " + otp + "\n\n" +
                "This code is valid for 10 minutes.\n\n" +
                "If you did not request this, please ignore this email."
            );
            mailSender.send(message);
            log.info("OTP email sent to {}", toEmail);
            return true;
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
            return false;
        }
    }
}
