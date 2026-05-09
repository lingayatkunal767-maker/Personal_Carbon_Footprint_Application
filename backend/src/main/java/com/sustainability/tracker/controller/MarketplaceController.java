package com.sustainability.tracker.controller;

import com.sustainability.tracker.dto.marketplace.OrderBillDTO;
import com.sustainability.tracker.dto.marketplace.OrderItemBillDTO;
import com.sustainability.tracker.entity.Order;
import com.sustainability.tracker.entity.OrderItem;
import com.sustainability.tracker.entity.Product;
import com.sustainability.tracker.service.MarketplaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Marketplace Controller
 * API endpoints for eco-friendly products and orders
 */
@RestController
@RequestMapping("/api/marketplace")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed.origins}")
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(marketplaceService.getAllProducts());
    }

    @GetMapping("/products/category/{category}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(marketplaceService.getProductsByCategory(category));
    }

    @GetMapping("/products/in-stock")
    public ResponseEntity<List<Product>> getProductsInStock() {
        return ResponseEntity.ok(marketplaceService.getProductsInStock());
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(marketplaceService.getProductById(id));
    }

    /**
     * Create an order.
     * Supports both formats for items:
     * 1) items: { "1": 2, "3": 1 }
     * 2) items: [{ "productId": 1, "quantity": 2 }]
     */
    @PostMapping("/orders")
    public ResponseEntity<OrderBillDTO> createOrder(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        Map<Long, Integer> items = parseItems(request.get("items"));

        String shippingAddress = asString(request.get("shippingAddress"));
        String contactPhone = asString(request.get("contactPhone"));
        String paymentMethod = asString(request.get("paymentMethod"));
        BigDecimal ecoPointsUsed = asBigDecimal(request.get("ecoPointsUsed"), BigDecimal.ZERO);
        String paymentReference = asString(request.get("paymentReference"));
        String notes = asString(request.get("notes"));

        Order order = marketplaceService.createOrder(
                userId,
                items,
                shippingAddress,
                contactPhone,
                paymentMethod,
                ecoPointsUsed,
                paymentReference,
                notes
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(toOrderBillDTO(order));
    }

    @GetMapping("/orders/user/{userId}")
    public ResponseEntity<List<OrderBillDTO>> getUserOrders(@PathVariable Long userId) {
        List<Order> orders = marketplaceService.getUserOrders(userId);
        List<OrderBillDTO> response = orders.stream().map(this::toOrderBillDTO).toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/orders/{orderNumber}")
    public ResponseEntity<OrderBillDTO> getOrderByNumber(@PathVariable String orderNumber) {
        return ResponseEntity.ok(toOrderBillDTO(marketplaceService.getOrderByNumber(orderNumber)));
    }

    @PutMapping("/orders/{id}/confirm")
    public ResponseEntity<Map<String, String>> confirmOrder(@PathVariable Long id) {
        marketplaceService.confirmOrder(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Order confirmed successfully");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/orders/{id}/ship")
    public ResponseEntity<Map<String, String>> shipOrder(@PathVariable Long id) {
        marketplaceService.shipOrder(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Order shipped successfully");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/orders/{id}/deliver")
    public ResponseEntity<Map<String, String>> deliverOrder(@PathVariable Long id) {
        marketplaceService.deliverOrder(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Order delivered successfully");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/orders/{id}/cancel")
    public ResponseEntity<Map<String, String>> cancelOrder(@PathVariable Long id) {
        marketplaceService.cancelOrder(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Order cancelled successfully");
        return ResponseEntity.ok(response);
    }

    private Map<Long, Integer> parseItems(Object itemsObj) {
        if (itemsObj == null) {
            throw new IllegalArgumentException("items are required");
        }

        Map<Long, Integer> items = new HashMap<>();

        if (itemsObj instanceof Map<?, ?> itemsRaw) {
            itemsRaw.forEach((key, value) -> {
                Long productId = Long.valueOf(String.valueOf(key));
                Integer quantity = Integer.valueOf(String.valueOf(value));
                items.put(productId, quantity);
            });
            return items;
        }

        if (itemsObj instanceof List<?> itemList) {
            for (Object itemObj : itemList) {
                if (!(itemObj instanceof Map<?, ?> itemMap)) {
                    throw new IllegalArgumentException("invalid item format in items list");
                }
                Object productIdObj = itemMap.get("productId");
                Object quantityObj = itemMap.get("quantity");
                if (productIdObj == null || quantityObj == null) {
                    throw new IllegalArgumentException("each item must include productId and quantity");
                }
                Long productId = Long.valueOf(String.valueOf(productIdObj));
                Integer quantity = Integer.valueOf(String.valueOf(quantityObj));
                items.put(productId, quantity);
            }
            return items;
        }

        throw new IllegalArgumentException("items must be a map or list");
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value).trim();
    }

    private BigDecimal asBigDecimal(Object value, BigDecimal fallback) {
        if (value == null) {
            return fallback;
        }
        try {
            return new BigDecimal(String.valueOf(value));
        } catch (NumberFormatException ex) {
            return fallback;
        }
    }

    private OrderBillDTO toOrderBillDTO(Order order) {
        List<OrderItemBillDTO> itemDTOs = new ArrayList<>();
        for (OrderItem item : order.getItems()) {
            itemDTOs.add(new OrderItemBillDTO(
                    item.getId(),
                    item.getProduct().getId(),
                    item.getProduct().getName(),
                    item.getQuantity(),
                    item.getUnitPrice(),
                    item.getSubtotal()
            ));
        }

        return new OrderBillDTO(
                order.getId(),
                order.getOrderNumber(),
                order.getTotalAmount(),
                order.getEcoPointsUsed(),
                order.getStatus(),
                order.getPaymentMethod(),
                order.getShippingAddress(),
                order.getContactPhone(),
                order.getNotes(),
                order.getCreatedAt(),
                order.getConfirmedAt(),
                order.getCancelledAt(),
                itemDTOs
        );
    }
}
