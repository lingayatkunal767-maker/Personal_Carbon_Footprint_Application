package com.ecotrack.backend.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "system_logs")
public class SystemLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userEmail;   // who performed action
    private String role;        // ADMIN / USER
    private String action;      // LOGIN, CREATE_BADGE, etc.
    private String details;     // description

    private LocalDateTime timestamp;

    // Constructors
    public SystemLog() {}

    public SystemLog(String userEmail, String role, String action, String details) {
        this.userEmail = userEmail;
        this.role = role;
        this.action = action;
        this.details = details;
        this.timestamp = LocalDateTime.now();
    }

    // Getters & Setters
    // (generate using IDE)
}