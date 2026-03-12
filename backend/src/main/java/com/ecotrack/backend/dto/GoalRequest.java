package com.ecotrack.backend.dto;
import lombok.Data;
import java.time.LocalDate;

@Data
public class GoalRequest {
    private String title;
    private String description;
    private String category;
    private Double targetAmount;
    private LocalDate deadline;
}
