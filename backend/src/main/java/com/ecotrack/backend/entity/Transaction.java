package com.ecotrack.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Without @JsonIgnoreProperties Jackson recurses into User → everything → StackOverflow (500)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler",
            "password", "otp", "otpExpiry", "credits", "enabled", "createdAt", "role"})
    private User user;

    // Same fix for MarketplaceItem
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private MarketplaceItem item;

    private LocalDateTime transactionDate = LocalDateTime.now();
    private Double amountPaid;
    private String itemName;
    private String status; // COMPLETED | UNSUCCESSFUL
}
