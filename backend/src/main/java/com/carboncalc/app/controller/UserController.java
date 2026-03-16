package com.carboncalc.app.controller;

import com.carboncalc.app.dto.common.ApiResponse;
import com.carboncalc.app.dto.user.UpdateProfileRequest;
import com.carboncalc.app.dto.user.UserProfileResponse;
import com.carboncalc.app.dto.user.UserSummaryResponse;
import com.carboncalc.app.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{userId}/profile")
    public ApiResponse<UserProfileResponse> getProfile(@PathVariable Long userId) {
        return ApiResponse.<UserProfileResponse>builder()
                .success(true)
                .message("Profile fetched successfully")
                .data(userService.getProfile(userId))
                .build();
    }

    @PutMapping("/{userId}/profile")
    public ApiResponse<UserProfileResponse> updateProfile(@PathVariable Long userId,
                                                          @RequestBody UpdateProfileRequest request) {
        return ApiResponse.<UserProfileResponse>builder()
                .success(true)
                .message("Profile updated successfully")
                .data(userService.updateProfile(userId, request))
                .build();
    }

    @GetMapping("/{userId}/summary")
    public ApiResponse<UserSummaryResponse> getSummary(@PathVariable Long userId) {
        return ApiResponse.<UserSummaryResponse>builder()
                .success(true)
                .message("User summary fetched successfully")
                .data(userService.getSummary(userId))
                .build();
    }
}