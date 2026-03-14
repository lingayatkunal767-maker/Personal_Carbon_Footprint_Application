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
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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
        return productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    /**
     * Create an order
     * @param userId User placing the order
     * @param items Map of product IDs to quantities
     * @param shippingAddress Delivery address
     * @param contactPhone Contact number
     * @param useEcoPoints Whether to use eco points for payment
     */
    public Order createOrder(Long userId, Map<Long, Integer> items, String shippingAddress, 
                            String contactPhone, boolean useEcoPoints) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(shippingAddress);
        order.setContactPhone(contactPhone);
        order.setStatus("PENDING");

        // Add items to order
        for (Map.Entry<Long, Integer> entry : items.entrySet()) {
            Long productId = entry.getKey();
            Integer quantity = entry.getValue();

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

            // Check stock
            if (!product.isInStock() || product.getStockQuantity() < quantity) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            // Create order item
            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(quantity);
            
            BigDecimal unitPrice = useEcoPoints && product.getEcoPointsPrice() != null 
                    ? product.getEcoPointsPrice() 
                    : product.getPrice();
            
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

        if (useEcoPoints) {
            order.setEcoPointsUsed(order.getTotalAmount());
            order.setPaymentMethod("ECO_POINTS");
        } else {
            order.setPaymentMethod("CREDIT_CARD");
        }

        order = orderRepository.save(order);
        
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
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        order.setStatus("CONFIRMED");
        order.setConfirmedAt(LocalDateTime.now());
        orderRepository.save(order);

        // Notify user
        notificationService.notifyOrderConfirmed(
                order.getUser().getId(),
                order.getOrderNumber(),
                order.getId()
        );
        
        log.info("✅ Confirmed order {}", order.getOrderNumber());
    }

    /**
     * Ship order
     */
    public void shipOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
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
        Order order = orderRepository.findById(orderId)
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
        Order order = orderRepository.findById(orderId)
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
}
