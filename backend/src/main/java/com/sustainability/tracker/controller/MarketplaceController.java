package com.sustainability.tracker.controller;

import com.sustainability.tracker.entity.Order;
import com.sustainability.tracker.entity.Product;
import com.sustainability.tracker.service.MarketplaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    /**
     * Get all active products
     * GET /api/marketplace/products
     */
    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = marketplaceService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    /**
     * Get products by category
     * GET /api/marketplace/products/category/{category}
     */
    @GetMapping("/products/category/{category}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable String category) {
        List<Product> products = marketplaceService.getProductsByCategory(category);
        return ResponseEntity.ok(products);
    }

    /**
     * Get products in stock
     * GET /api/marketplace/products/in-stock
     */
    @GetMapping("/products/in-stock")
    public ResponseEntity<List<Product>> getProductsInStock() {
        List<Product> products = marketplaceService.getProductsInStock();
        return ResponseEntity.ok(products);
    }

    /**
     * Get product by ID
     * GET /api/marketplace/products/{id}
     */
    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Product product = marketplaceService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    /**
     * Create an order
     * POST /api/marketplace/orders
     * Request body: { userId, items: { productId: quantity }, shippingAddress, contactPhone, useEcoPoints }
     */
    @PostMapping("/orders")
    public ResponseEntity<Order> createOrder(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        
        @SuppressWarnings("unchecked")
        Map<String, Integer> itemsRaw = (Map<String, Integer>) request.get("items");
        Map<Long, Integer> items = new HashMap<>();
        itemsRaw.forEach((key, value) -> items.put(Long.valueOf(key), value));
        
        String shippingAddress = (String) request.get("shippingAddress");
        String contactPhone = (String) request.get("contactPhone");
        boolean useEcoPoints = request.containsKey("useEcoPoints") 
                ? (Boolean) request.get("useEcoPoints") 
                : false;

        Order order = marketplaceService.createOrder(userId, items, shippingAddress, contactPhone, useEcoPoints);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    /**
     * Get user orders
     * GET /api/marketplace/orders/user/{userId}
     */
    @GetMapping("/orders/user/{userId}")
    public ResponseEntity<List<Order>> getUserOrders(@PathVariable Long userId) {
        List<Order> orders = marketplaceService.getUserOrders(userId);
        return ResponseEntity.ok(orders);
    }

    /**
     * Get order by order number
     * GET /api/marketplace/orders/{orderNumber}
     */
    @GetMapping("/orders/{orderNumber}")
    public ResponseEntity<Order> getOrderByNumber(@PathVariable String orderNumber) {
        Order order = marketplaceService.getOrderByNumber(orderNumber);
        return ResponseEntity.ok(order);
    }

    /**
     * Confirm order
     * PUT /api/marketplace/orders/{id}/confirm
     */
    @PutMapping("/orders/{id}/confirm")
    public ResponseEntity<Map<String, String>> confirmOrder(@PathVariable Long id) {
        marketplaceService.confirmOrder(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Order confirmed successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * Ship order
     * PUT /api/marketplace/orders/{id}/ship
     */
    @PutMapping("/orders/{id}/ship")
    public ResponseEntity<Map<String, String>> shipOrder(@PathVariable Long id) {
        marketplaceService.shipOrder(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Order shipped successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * Deliver order
     * PUT /api/marketplace/orders/{id}/deliver
     */
    @PutMapping("/orders/{id}/deliver")
    public ResponseEntity<Map<String, String>> deliverOrder(@PathVariable Long id) {
        marketplaceService.deliverOrder(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Order delivered successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * Cancel order
     * PUT /api/marketplace/orders/{id}/cancel
     */
    @PutMapping("/orders/{id}/cancel")
    public ResponseEntity<Map<String, String>> cancelOrder(@PathVariable Long id) {
        marketplaceService.cancelOrder(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Order cancelled successfully");
        return ResponseEntity.ok(response);
    }
}
