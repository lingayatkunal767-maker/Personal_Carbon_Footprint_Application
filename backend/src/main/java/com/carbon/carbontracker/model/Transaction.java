package com.carbon.carbontracker.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "marketplace_item_id", nullable = false)
    private MarketplaceItem marketplaceItem;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(length = 20)
    private String status = "SUCCESS";

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}