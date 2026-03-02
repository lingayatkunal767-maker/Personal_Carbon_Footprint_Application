package com.deepika.carbontracker.controller;

import com.deepika.carbontracker.dto.UserProfileResponse;
import com.deepika.carbontracker.dto.UserUpdateRequest;
import com.deepika.carbontracker.model.User;
import com.deepika.carbontracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // ------------------------------------------------------------------
    // Helper — resolve the currently authenticated user from JWT
    // ------------------------------------------------------------------
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    // GET /api/users/me — get logged-in user's profile
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getProfile() {
        User user = getCurrentUser();
        return ResponseEntity.ok(toResponse(user));
    }

    // PUT /api/users/me — update logged-in user's name
    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@RequestBody UserUpdateRequest request) {
        try {
            User user = getCurrentUser();
            if (request.getName() != null && !request.getName().isBlank()) {
                user.setName(request.getName());
            }
            userRepository.save(user);
            return ResponseEntity.ok(toResponse(user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /api/users/me — delete logged-in user's account
    @DeleteMapping("/me")
    public ResponseEntity<String> deleteAccount() {
        User user = getCurrentUser();
        userRepository.delete(user);
        return ResponseEntity.ok("Account deleted successfully.");
    }

    // ------------------------------------------------------------------
    // Mapping helper
    // ------------------------------------------------------------------
    private UserProfileResponse toResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
