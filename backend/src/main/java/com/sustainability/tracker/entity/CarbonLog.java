package com.sustainability.tracker.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "carbon_logs", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "log_date"})
})
@Data
@NoArgsConstructor
public class CarbonLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @NotNull
    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(name = "transport_emission", precision = 10, scale = 2)
    private BigDecimal transportEmission;

    @Column(name = "food_emission", precision = 10, scale = 2)
    private BigDecimal foodEmission;

    @Column(name = "energy_emission", precision = 10, scale = 2)
    private BigDecimal energyEmission;

    @Column(name = "total_emission", precision = 10, scale = 2)
    private BigDecimal totalEmission;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
