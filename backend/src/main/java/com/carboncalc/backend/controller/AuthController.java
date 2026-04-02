package com.carboncalc.backend.controller;

import com.carboncalc.backend.config.RateLimiter;
import com.carboncalc.backend.dto.RegisterRequest;
import com.carboncalc.backend.dto.LoginRequest;
import com.carboncalc.backend.dto.LoginResponse;
import com.carboncalc.backend.entity.User;
import com.carboncalc.backend.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    @Autowired private AuthService authService;
    @Autowired private RateLimiter rateLimiter;

    /** Resolve the real client IP, respecting reverse-proxy headers. */
    private String clientIp(HttpServletRequest req) {
        String forwarded = req.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return req.getRemoteAddr();
    }

    @PostMapping("/register")
    public User register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletRequest req) {
        String ip = clientIp(req);
        if (!rateLimiter.allowLogin(ip)) {
            long retryAfter = rateLimiter.loginRetryAfter(ip);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .header(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfter))
                .body(Map.of("error", "Too many login attempts. Please wait " + retryAfter + " seconds before trying again."));
        }
        LoginResponse res = authService.login(request);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/google")
    public ResponseEntity<LoginResponse> googleLogin(@RequestBody Map<String, String> body) {
        LoginResponse res = authService.googleLogin(body.get("email"), body.get("name"));
        return ResponseEntity.ok(res);
    }

    @PostMapping("/forgot-password/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body, HttpServletRequest req) {
        String ip = clientIp(req);
        if (!rateLimiter.allowOtp(ip)) {
            long retryAfter = rateLimiter.otpRetryAfter(ip);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .header(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfter))
                .body(Map.of("error", "Too many OTP requests. Please wait " + retryAfter + " seconds before trying again."));
        }
        authService.sendOtp(body.get("email"));
        return ResponseEntity.ok(Map.of("message", "OTP sent to your email"));
    }

    @PostMapping("/forgot-password/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOtp(@RequestBody Map<String, String> body) {
        authService.verifyOtp(body.get("email"), body.get("otp"));
        return ResponseEntity.ok(Map.of("message", "OTP verified"));
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> body) {
        authService.resetPassword(body.get("email"), body.get("otp"), body.get("newPassword"));
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    /** GET /api/auth/me — returns current user's profile */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }
        String token = authHeader.substring(7);
        String email = authService.getEmailFromToken(token);
        Map<String, Object> profile = authService.getUserProfile(email);
        return ResponseEntity.ok(profile);
    }
}
