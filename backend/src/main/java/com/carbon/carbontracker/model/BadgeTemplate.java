package com.carbon.carbontracker.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "badge_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BadgeTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Human readable name, e.g. "First Log"
    @Column(nullable = false, unique = true)
    private String name;

    // Optional short key for frontend mapping, e.g. FIRST_LOG
    @Column(name = "code", unique = true)
    private String code;

    // Description shown to user
    @Column(columnDefinition = "TEXT")
    private String description;

    // Pre-condition text, e.g. "Log your very first carbon entry"
    @Column(name = "condition_text", columnDefinition = "TEXT")
    private String conditionText;

    // Simple icon key / emoji
    private String icon;

    // Whether this badge is currently available
    private boolean active;
}

