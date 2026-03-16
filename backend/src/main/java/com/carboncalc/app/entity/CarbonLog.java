package com.carboncalc.app.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "carbon_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarbonLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "transport_emission")
    private Double transportEmission;

    @Column(name = "food_emission")
    private Double foodEmission;

    @Column(name = "energy_emission")
    private Double energyEmission;

    @Column(name = "total_emission")
    private Double totalEmission;
}