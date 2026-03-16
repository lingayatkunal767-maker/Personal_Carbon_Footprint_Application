package com.carboncalc.app.dto.badge;

import com.carboncalc.app.enums.BadgeType;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BadgeResponse {

    private Long id;
    private BadgeType badgeName;
    private String description;
    private LocalDateTime awardedAt;
}