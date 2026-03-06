package com.sustainability.tracker.controller;

import com.sustainability.tracker.dto.AuthRequest;
import com.sustainability.tracker.dto.AuthResponse;
import com.sustainability.tracker.dto.GoogleAuthRequest;
import com.sustainability.tracker.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService; // ✅ injected properly

    @PostMapping("/register")
    public AuthResponse register(@RequestBody AuthRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest request) {
        return authService.login(request);
    }

    // ✅ FIX: this compiles now because AuthService has googleLogin()
    @PostMapping("/google")
    public AuthResponse googleLogin(@RequestBody GoogleAuthRequest request) {
        return authService.googleLogin(request);
    }
}