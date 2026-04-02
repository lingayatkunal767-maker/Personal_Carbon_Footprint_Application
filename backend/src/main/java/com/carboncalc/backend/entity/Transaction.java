package com.carboncalc.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marketplace_item_id", nullable = false)
    private MarketplaceItem item;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String status; // COMPLETED, FAILED

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
