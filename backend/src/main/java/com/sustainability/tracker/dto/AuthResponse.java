package com.sustainability.tracker.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AuthResponse {
    private boolean success;
    private String message;

    private Long userId;
    private String name;
    private String email;
    private String profilePicture;
    private String role;
    private Boolean active;

    public AuthResponse(boolean success,
                        String message,
                        Long userId,
                        String name,
                        String email,
                        String profilePicture) {
        this(success, message, userId, name, email, profilePicture, null, null);
    }

    public AuthResponse(boolean success,
                        String message,
                        Long userId,
                        String name,
                        String email,
                        String profilePicture,
                        String role,
                        Boolean active) {
        this.success = success;
        this.message = message;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.profilePicture = profilePicture;
        this.role = role;
        this.active = active;
    }
}