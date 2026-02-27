package com.sustainability.tracker.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthRequest {
    private String name;     // only used for register
    private String email;
    private String password;
}
