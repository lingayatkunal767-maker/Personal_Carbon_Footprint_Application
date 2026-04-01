package com.sustainability.tracker.service;

import com.sustainability.tracker.entity.Order;
import com.sustainability.tracker.entity.OrderItem;
import com.sustainability.tracker.entity.Product;
import com.sustainability.tracker.entity.User;
import com.sustainability.tracker.repository.OrderRepository;
import com.sustainability.tracker.repository.ProductRepository;
import com.sustainability.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Marketplace Service
 * Manages eco-friendly products and orders
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class MarketplaceService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    /**
     * Get all active products
     */
    public List<Product> getAllProducts() {
        return productRepository.findByIsActiveTrueOrderByCreatedAtDesc();
    }

    /**
     * Get products by category
     */
    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategoryAndIsActiveTrueOrderByRatingDesc(category);
    }

    /**
     * Get products in stock
     */
    public List<Product> getProductsInStock() {
        return productRepository.findByIsActiveTrueAndStockQuantityGreaterThanOrderByCreatedAtDesc(0);
    }

    /**
     * Get product by ID
     */
    public Product getProductById(Long productId) {
        Long safeProductId = Objects.requireNonNull(productId, "productId is required");
        return productRepository.findById(safeProductId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    /**
     * Create an order
     * @param userId User placing the order
     * @param items Map of product IDs to quantities
     * @param shippingAddress Delivery address
     * @param contactPhone Contact number
     * @param paymentMethod Payment mode (UPI, CARD, CASH_ON_DELIVERY)
     * @param ecoPointsUsed Eco points redeemed for discount
     * @param paymentReference UPI ID / transaction reference
     * @param notes Additional order notes
     */
    public Order createOrder(Long userId, Map<Long, Integer> items, String shippingAddress, 
                            String contactPhone, String paymentMethod, BigDecimal ecoPointsUsed,
                            String paymentReference, String notes) {
        Long safeUserId = Objects.requireNonNull(userId, "userId is required");
        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("At least one item is required");
        }
        if (isBlank(shippingAddress)) {
            throw new IllegalArgumentException("Shipping address is required");
        }
        if (isBlank(contactPhone)) {
            throw new IllegalArgumentException("Contact phone is required");
        }
        if (!contactPhone.trim().matches("^\\+?[0-9]{10,15}$")) {
            throw new IllegalArgumentException("Contact phone must be 10 to 15 digits");
        }

        String normalizedPaymentMethod = isBlank(paymentMethod) ? "UPI" : paymentMethod.trim().toUpperCase();
        if ("UPI".equals(normalizedPaymentMethod)) {
            if (isBlank(paymentReference) || !paymentReference.contains("@")) {
                throw new IllegalArgumentException("Valid UPI ID is required for UPI payment");
            }
        }

        BigDecimal requestedEcoPoints = ecoPointsUsed == null ? BigDecimal.ZERO : ecoPointsUsed.max(BigDecimal.ZERO);

        User user = userRepository.findById(safeUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(shippingAddress.trim());
        order.setContactPhone(contactPhone.trim());
        order.setStatus("PENDING");

        // Add items to order
        for (Map.Entry<Long, Integer> entry : items.entrySet()) {
            Long productId = entry.getKey();
            Integer quantity = entry.getValue();

            if (quantity == null || quantity <= 0) {
                throw new IllegalArgumentException("Quantity must be greater than 0 for product: " + productId);
            }

                Long safeProductId = Objects.requireNonNull(productId, "productId is required");

                Product product = productRepository.findById(safeProductId)
                    .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

            // Check stock
            if (!product.isInStock() || product.getStockQuantity() < quantity) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            // Create order item
            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(quantity);
                BigDecimal unitPrice = product.getPrice();

            orderItem.setUnitPrice(unitPrice);
            orderItem.calculateSubtotal();
            
            order.addItem(orderItem);

            // Reduce stock
            product.reduceStock(quantity);
            productRepository.save(product);
        }

        // Calculate totals
        order.calculateTotal();
        order.calculateCarbonSaving();

    BigDecimal rawTotal = order.getTotalAmount() == null ? BigDecimal.ZERO : order.getTotalAmount();
    BigDecimal discountFromPoints = requestedEcoPoints
        .divide(new BigDecimal("10"), 2, RoundingMode.DOWN);
    BigDecimal maxAllowedDiscount = rawTotal.multiply(new BigDecimal("0.50"))
        .setScale(2, RoundingMode.HALF_UP);
    BigDecimal appliedDiscount = discountFromPoints.min(maxAllowedDiscount);
    BigDecimal payableAmount = rawTotal.subtract(appliedDiscount)
        .max(BigDecimal.ZERO)
        .setScale(2, RoundingMode.HALF_UP);
    BigDecimal actualEcoPointsUsed = appliedDiscount
        .multiply(new BigDecimal("10"))
        .setScale(2, RoundingMode.HALF_UP);

    order.setTotalAmount(payableAmount);
    order.setEcoPointsUsed(actualEcoPointsUsed);
    order.setPaymentMethod(normalizedPaymentMethod);
    order.setStatus("CONFIRMED");
    order.setConfirmedAt(LocalDateTime.now());
    order.setNotes(buildOrderNotes(notes, paymentReference, rawTotal, appliedDiscount, requestedEcoPoints));

        order = orderRepository.save(order);

        notificationService.notifyOrderConfirmed(
            user.getId(),
            order.getOrderNumber(),
            order.getId()
        );
        
        log.info("✅ Created order {} for user {}", order.getOrderNumber(), userId);
        return order;
    }

    /**
     * Get user orders
     */
    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get order by order number
     */
    public Order getOrderByNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    /**
     * Confirm order
     */
    public void confirmOrder(Long orderId) {
        Long safeOrderId = Objects.requireNonNull(orderId, "orderId is required");
        Order order = orderRepository.findById(safeOrderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        boolean alreadyConfirmed = "CONFIRMED".equalsIgnoreCase(order.getStatus());
        
        order.setStatus("CONFIRMED");
        order.setConfirmedAt(LocalDateTime.now());
        orderRepository.save(order);

        // Notify user
        if (!alreadyConfirmed) {
            notificationService.notifyOrderConfirmed(
                order.getUser().getId(),
                order.getOrderNumber(),
                order.getId()
            );
        }
        
        log.info("✅ Confirmed order {}", order.getOrderNumber());
    }

    /**
     * Ship order
     */
    public void shipOrder(Long orderId) {
        Long safeOrderId = Objects.requireNonNull(orderId, "orderId is required");
        Order order = orderRepository.findById(safeOrderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        order.setStatus("SHIPPED");
        order.setShippedAt(LocalDateTime.now());
        orderRepository.save(order);
        
        log.info("📦 Shipped order {}", order.getOrderNumber());
    }

    /**
     * Deliver order
     */
    public void deliverOrder(Long orderId) {
        Long safeOrderId = Objects.requireNonNull(orderId, "orderId is required");
        Order order = orderRepository.findById(safeOrderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        order.setStatus("DELIVERED");
        order.setDeliveredAt(LocalDateTime.now());
        orderRepository.save(order);
        
        log.info("✅ Delivered order {}", order.getOrderNumber());
    }

    /**
     * Cancel order
     */
    public void cancelOrder(Long orderId) {
        Long safeOrderId = Objects.requireNonNull(orderId, "orderId is required");
        Order order = orderRepository.findById(safeOrderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Only allow cancellation of pending or confirmed orders
        if (!order.getStatus().equals("PENDING") && !order.getStatus().equals("CONFIRMED")) {
            throw new RuntimeException("Cannot cancel order with status: " + order.getStatus());
        }

        // Restore stock
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }

        order.setStatus("CANCELLED");
        order.setCancelledAt(LocalDateTime.now());
        orderRepository.save(order);
        
        log.info("❌ Cancelled order {}", order.getOrderNumber());
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String buildOrderNotes(String userNotes,
                                   String paymentReference,
                                   BigDecimal rawTotal,
                                   BigDecimal appliedDiscount,
                                   BigDecimal requestedEcoPoints) {
        StringBuilder notesBuilder = new StringBuilder();
        if (!isBlank(userNotes)) {
            notesBuilder.append(userNotes.trim());
        }
        if (!isBlank(paymentReference)) {
            if (notesBuilder.length() > 0) {
                notesBuilder.append(" | ");
            }
            notesBuilder.append("PaymentRef=").append(paymentReference.trim());
        }
        if (notesBuilder.length() > 0) {
            notesBuilder.append(" | ");
        }
        notesBuilder.append("RawTotal=")
                .append(rawTotal == null ? BigDecimal.ZERO : rawTotal)
                .append(", Discount=")
                .append(appliedDiscount == null ? BigDecimal.ZERO : appliedDiscount)
                .append(", RequestedEcoPoints=")
                .append(requestedEcoPoints == null ? BigDecimal.ZERO : requestedEcoPoints);
        return notesBuilder.toString();
    }
}
