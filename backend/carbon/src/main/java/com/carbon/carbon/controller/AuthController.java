package com.carbon.carbon.controller;

import com.carbon.carbon.dto.AuthResponse;
import com.carbon.carbon.dto.ForgotPasswordRequest;
import com.carbon.carbon.dto.LoginRequest;
import com.carbon.carbon.dto.OtpRequest;
import com.carbon.carbon.dto.RegisterRequest;
import com.carbon.carbon.dto.ResetPasswordRequest;
import com.carbon.carbon.dto.VerifyOtpRequest;
import com.carbon.carbon.entity.OtpToken;
import com.carbon.carbon.entity.PasswordResetToken;
import com.carbon.carbon.entity.User;
import com.carbon.carbon.repository.OtpTokenRepository;
import com.carbon.carbon.repository.PasswordResetTokenRepository;
import com.carbon.carbon.repository.UserRepository;
import com.carbon.carbon.security.JwtUtil;
// import com.carbon.carbon.service.EmailService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final OtpTokenRepository otpTokenRepository;

    public AuthController(UserRepository userRepository,
                          AuthenticationManager authenticationManager,
                          JwtUtil jwtUtil,
                          PasswordEncoder passwordEncoder,
                          PasswordResetTokenRepository resetTokenRepository,
                          OtpTokenRepository otpTokenRepository) {
        this.userRepository = userRepository;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
        this.resetTokenRepository = resetTokenRepository;
        this.otpTokenRepository = otpTokenRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "User already exists with this email."));
        }
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "User registered successfully."));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email or password."));
        }
        String token = jwtUtil.generateToken(request.getEmail());
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@Valid @RequestBody OtpRequest request) {
        // Check if email is already registered
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "An account with this email already exists."));
        }

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));

        // Save OTP to database with 10-minute expiry
        OtpToken otpToken = new OtpToken();
        otpToken.setEmail(request.getEmail());
        otpToken.setOtp(otp);
        otpToken.setExpiryDate(LocalDateTime.now().plusMinutes(10));
        otpToken.setUsed(false);
        otpTokenRepository.save(otpToken);

        // Send OTP via email (commented out until email is configured)
        // emailService.sendOtpEmail(request.getEmail(), otp);
        System.out.println("[DEV] OTP for " + request.getEmail() + ": " + otp);

        return ResponseEntity.ok(Map.of("message", "OTP sent to your email."));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        var otpOpt = otpTokenRepository.findTopByEmailAndUsedFalseOrderByExpiryDateDesc(request.getEmail());

        if (otpOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "No OTP found for this email. Please request a new one."));
        }

        OtpToken otpToken = otpOpt.get();

        if (otpToken.isExpired()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "OTP has expired. Please request a new one."));
        }

        if (!otpToken.getOtp().equals(request.getOtp())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid OTP. Please try again."));
        }

        // Mark OTP as used
        otpToken.setUsed(true);
        otpTokenRepository.save(otpToken);

        return ResponseEntity.ok(Map.of("message", "Email verified successfully."));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        var userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            // Return success even if email not found to prevent email enumeration
            return ResponseEntity.ok(Map.of("message", "If an account with that email exists, a reset link has been sent."));
        }

        User user = userOpt.get();

        // Generate a unique reset token
        String resetToken = UUID.randomUUID().toString();

        // Save token to database with 30-minute expiry
        PasswordResetToken tokenEntity = new PasswordResetToken();
        tokenEntity.setToken(resetToken);
        tokenEntity.setUser(user);
        tokenEntity.setExpiryDate(LocalDateTime.now().plusMinutes(30));
        tokenEntity.setUsed(false);
        resetTokenRepository.save(tokenEntity);

        // Send email (commented out until Gmail App Password is configured)
        // emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
        System.out.println("[DEV] Password reset link: http://localhost:5173/reset-password?token=" + resetToken);

        return ResponseEntity.ok(Map.of("message", "If an account with that email exists, a reset link has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        var tokenOpt = resetTokenRepository.findByToken(request.getToken());
        if (tokenOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid reset token."));
        }

        PasswordResetToken resetToken = tokenOpt.get();

        if (resetToken.isUsed()) {
            return ResponseEntity.badRequest().body(Map.of("message", "This reset link has already been used."));
        }

        if (resetToken.isExpired()) {
            return ResponseEntity.badRequest().body(Map.of("message", "This reset link has expired. Please request a new one."));
        }

        // Update the user's password
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Mark token as used
        resetToken.setUsed(true);
        resetTokenRepository.save(resetToken);

        return ResponseEntity.ok(Map.of("message", "Password has been reset successfully. You can now login with your new password."));
    }
}
