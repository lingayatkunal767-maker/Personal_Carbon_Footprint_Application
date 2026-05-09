package com.sustainability.tracker.dto;

import com.sustainability.tracker.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserDTO {
    private Long id;
    private String name;
    private String email;
    private String role;
    private Boolean active;
    private String oauthProvider;
    private LocalDateTime memberSince;

    public static AdminUserDTO from(User user) {
        return new AdminUserDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getIsActive(),
                user.getOauthProvider(),
                user.getMemberSince()
        );
    }
}
