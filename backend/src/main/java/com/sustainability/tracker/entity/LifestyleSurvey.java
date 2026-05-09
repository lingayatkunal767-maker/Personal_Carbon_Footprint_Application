package com.sustainability.tracker.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "lifestyle_surveys")
@Data
@NoArgsConstructor
public class LifestyleSurvey {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @NotNull
    @Column(name = "survey_date", nullable = false)
    private LocalDate surveyDate = LocalDate.now();

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "transport_mode", length = 20, nullable = false)
    private TransportMode transportMode;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "distance_km_per_day", nullable = false, precision = 10, scale = 2)
    private BigDecimal distanceKmPerDay;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "fuel_type", length = 20, nullable = false)
    private FuelType fuelType;

    @Min(0)
    @Column(name = "meals_non_veg_per_week")
    private Integer mealsNonVegPerWeek;

    @Min(0)
    @Column(name = "meals_veg_per_week")
    private Integer mealsVegPerWeek;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "electricity_kwh_per_month", nullable = false, precision = 10, scale = 2)
    private BigDecimal electricityKwhPerMonth;

    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "cooking_gas_cylinders_per_month", precision = 10, scale = 2)
    private BigDecimal cookingGasCylindersPerMonth;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum TransportMode {
        CAR, BIKE, BUS, TRAIN, WALK, AUTO, METRO
    }

    public enum FuelType {
        PETROL, DIESEL, EV, NA
    }
}
