package com.carboncalc.backend.service;

import com.carboncalc.backend.dto.LoginRequest;
import com.carboncalc.backend.dto.LoginResponse;
import com.carboncalc.backend.dto.RegisterRequest;
import com.carboncalc.backend.entity.User;
import com.carboncalc.backend.repository.UserRepository;
import com.carboncalc.backend.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class AuthService {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwtService;
    @Autowired private JavaMailSender mailSender;

    public User register(RegisterRequest request) {
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role("USER")
                .isActive(true)
                .build();
        return userRepository.save(user);
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("No account found with that email"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword()))
            throw new IllegalArgumentException("Invalid password");
        if (Boolean.FALSE.equals(user.getIsActive()))
            throw new IllegalArgumentException("Your account has been deactivated. Contact admin.");
        String token = jwtService.generateToken(user.getEmail());
        return new LoginResponse(token, user.getRole());
    }

    /** Google OAuth — find or create user by email, return JWT */
    public LoginResponse googleLogin(String email, String name) {
        if (email == null || email.isBlank())
            throw new IllegalArgumentException("Invalid Google account");

        User user = userRepository.findByEmail(email).orElseGet(() ->
            userRepository.save(User.builder()
                .name(name != null && !name.isBlank() ? name : email.split("@")[0])
                .email(email)
                .password(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                .role("USER")
                .isActive(true)
                .build())
        );

        if (Boolean.FALSE.equals(user.getIsActive()))
            throw new IllegalArgumentException("Your account has been deactivated. Contact admin.");

        String token = jwtService.generateToken(user.getEmail());
        return new LoginResponse(token, user.getRole());
    }

    /** Step 1: generate OTP and send email */
    public void sendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No account found with that email"));

        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setOtpCode(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(email);
        msg.setSubject("CarbonCalc — Password Reset OTP");
        msg.setText("Your one-time password is: " + otp + "\n\nThis OTP expires in 10 minutes.\n\nIf you did not request this, ignore this email.");
        mailSender.send(msg);
    }

    /** Step 2: verify OTP */
    public void verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No account found with that email"));
        if (user.getOtpCode() == null || !user.getOtpCode().equals(otp))
            throw new IllegalArgumentException("Invalid OTP");
        if (user.getOtpExpiry() == null || LocalDateTime.now().isAfter(user.getOtpExpiry()))
            throw new IllegalArgumentException("OTP has expired");
    }

    /** Step 3: reset password */
    public void resetPassword(String email, String otp, String newPassword) {
        verifyOtp(email, otp); // re-verify before saving
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No account found with that email"));
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
    }

    /** Get email from JWT token */
    public String getEmailFromToken(String token) {
        return jwtService.extractEmail(token);
    }

    /** Get user profile by email */
    public java.util.Map<String, Object> getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return java.util.Map.of(
            "id",    user.getId(),
            "name",  user.getName() != null ? user.getName() : "",
            "email", user.getEmail(),
            "role",  user.getRole() != null ? user.getRole() : "USER"
        );
    }
}