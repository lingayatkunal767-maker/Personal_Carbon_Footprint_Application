package com.sustainability.tracker.controller;

import com.sustainability.tracker.dto.AuthRequest;
import com.sustainability.tracker.dto.AuthResponse;
import com.sustainability.tracker.dto.GoogleAuthRequest;
import com.sustainability.tracker.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // POST /api/auth/register
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@RequestBody AuthRequest request) {
        return authService.register(request);
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest request) {
        return authService.login(request);
    }

    // POST /api/auth/google  — upsert Google user, returns same AuthResponse
    @PostMapping("/google")
    public AuthResponse googleAuth(@RequestBody GoogleAuthRequest request) {
        return authService.loginWithGoogle(request);
    }
}
