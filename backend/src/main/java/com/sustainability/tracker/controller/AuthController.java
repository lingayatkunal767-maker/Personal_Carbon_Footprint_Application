package com.sustainability.tracker.controller;

import com.sustainability.tracker.dto.AuthRequest;
import com.sustainability.tracker.dto.AuthResponse;
import com.sustainability.tracker.dto.GoogleAuthRequest;
import com.sustainability.tracker.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService; // ✅ injected properly

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody AuthRequest request) {
        return authService.register(request);
    }

    @PostMapping("/admin/register")
    public AuthResponse registerAdmin(@Valid @RequestBody AuthRequest request) {
        return authService.registerAdmin(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody AuthRequest request) {
        return authService.login(request);
    }

    @PostMapping("/admin/login")
    public AuthResponse loginAdmin(@Valid @RequestBody AuthRequest request) {
        return authService.loginAdmin(request);
    }

    // ✅ FIX: this compiles now because AuthService has googleLogin()
    @PostMapping("/google")
    public AuthResponse googleLogin(@RequestBody GoogleAuthRequest request) {
        return authService.googleLogin(request);
    }
}