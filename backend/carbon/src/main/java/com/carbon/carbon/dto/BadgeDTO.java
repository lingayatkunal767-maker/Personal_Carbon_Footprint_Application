package com.carbon.carbon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BadgeDTO {
    private Long id;
    private Long userId;
    private String badgeName;
    private String description;
    private LocalDateTime awardedAt;
}
