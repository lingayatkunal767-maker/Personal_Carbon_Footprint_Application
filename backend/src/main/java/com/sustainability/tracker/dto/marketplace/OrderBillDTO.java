package com.sustainability.tracker.dto.marketplace;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderBillDTO {
    private Long id;
    private String orderNumber;
    private BigDecimal totalAmount;
    private BigDecimal ecoPointsUsed;
    private String status;
    private String paymentMethod;
    private String shippingAddress;
    private String contactPhone;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime confirmedAt;
    private LocalDateTime cancelledAt;
    private List<OrderItemBillDTO> items;
}
