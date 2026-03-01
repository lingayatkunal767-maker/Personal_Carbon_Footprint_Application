package com.deepika.carbontracker.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "surveys")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Survey {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "transport_mode")
    private String transportMode;

    @Column(name = "diet_type")
    private String dietType;

    @Column(name = "energy_usage")
    private Double energyUsage;

    // Stored as JSON string (e.g. {"weekly": true, "monthly": false})
    @Column(name = "frequency", columnDefinition = "TEXT")
    private String frequency;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
