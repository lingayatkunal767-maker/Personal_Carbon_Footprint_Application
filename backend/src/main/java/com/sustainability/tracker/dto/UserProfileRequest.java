package com.sustainability.tracker.dto;

import lombok.Data;

@Data
public class UserProfileRequest {
    private String name;
    private String email;
    private String profilePicture;
}
