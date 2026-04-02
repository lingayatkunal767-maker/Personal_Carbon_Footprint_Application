package com.carboncalc.backend.entity;

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

    // Transport
    @Column
    private String transport;           // car, bus, bike, walk, wfh, public_transport

    @Column
    private Double distanceKm;          // avg daily distance in km

    @Column
    private String fuelType;            // petrol, diesel, electric, hybrid (only for car)

    // Food
    @Column
    private String food;                // vegetarian, non-vegetarian, vegan

    @Column
    private Integer mealsPerDay;

    @Column
    private String eatingOutFrequency;  // never, rarely, sometimes, often, daily

    // Energy
    @Column
    private Double energy;              // monthly electricity kWh

    @Column
    private Boolean renewableEnergy;

    // Calculated emissions
    @Column
    private Double transportEmission;

    @Column
    private Double foodEmission;

    @Column
    private Double energyEmission;

    @Column
    private Double carbonScore;         // total

    @Column
    private LocalDateTime date;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
