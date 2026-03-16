package com.carboncalc.app.entity;

import com.carboncalc.app.enums.DietType;
import com.carboncalc.app.enums.EatingOutFrequency;
import com.carboncalc.app.enums.FuelType;
import com.carboncalc.app.enums.TransportMode;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "transport_mode", nullable = false)
    private TransportMode transportMode;

    @Enumerated(EnumType.STRING)
    @Column(name = "fuel_type")
    private FuelType fuelType;

    @Column(name = "distance_per_day")
    private Double distancePerDay;

    @Enumerated(EnumType.STRING)
    @Column(name = "diet_type", nullable = false)
    private DietType dietType;

    @Enumerated(EnumType.STRING)
    @Column(name = "eating_out_frequency", nullable = false)
    private EatingOutFrequency eatingOutFrequency;

    @Column(name = "meals_per_day")
    private Integer mealsPerDay;

    @Column(name = "monthly_electricity_usage")
    private Double monthlyElectricityUsage;

    @Column(name = "renewable_energy_usage")
    private Boolean renewableEnergyUsage;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}