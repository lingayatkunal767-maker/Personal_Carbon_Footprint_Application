package com.sustainability.tracker.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoogleAuthRequest {
    private String name;
    private String email;
    private String googleId;
    private String profilePicture;
}
