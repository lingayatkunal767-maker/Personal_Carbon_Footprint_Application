package com.carboncalc.app.controller;

import com.carboncalc.app.dto.auth.*;
import com.carboncalc.app.dto.common.ApiResponse;
import com.carboncalc.app.dto.common.MessageResponse;
import com.carboncalc.app.service.auth.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ApiResponse.<AuthResponse>builder()
                .success(true)
                .message("User registered successfully")
                .data(authService.register(request))
                .build();
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@RequestBody LoginRequest request) {
        return ApiResponse.<AuthResponse>builder()
                .success(true)
                .message("Login successful")
                .data(authService.login(request))
                .build();
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refresh(@RequestBody RefreshTokenRequest request) {
        return ApiResponse.<AuthResponse>builder()
                .success(true)
                .message("Token refreshed successfully")
                .data(authService.refresh(request.getRefreshToken()))
                .build();
    }

    @PostMapping("/logout")
    public ApiResponse<MessageResponse> logout(@RequestBody LogoutRequest request) {
        authService.logout(request.getRefreshToken());
        return ApiResponse.<MessageResponse>builder()
                .success(true)
                .message("Logout successful")
                .data(MessageResponse.builder().message("Logged out successfully").build())
                .build();
    }
}