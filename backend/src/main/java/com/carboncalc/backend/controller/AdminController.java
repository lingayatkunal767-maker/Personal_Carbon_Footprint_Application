package com.carboncalc.backend.controller;

import com.carboncalc.backend.dto.AdminUserResponse;
import com.carboncalc.backend.dto.BadgeDefinitionRequest;
import com.carboncalc.backend.dto.BadgeDefinitionResponse;
import com.carboncalc.backend.dto.MarketplaceItemRequest;
import com.carboncalc.backend.dto.MarketplaceItemResponse;
import com.carboncalc.backend.dto.TransactionResponse;
import com.carboncalc.backend.service.AdminService;
import com.carboncalc.backend.service.BadgeService;
import com.carboncalc.backend.service.MarketplaceService;
import com.carboncalc.backend.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final MarketplaceService marketplaceService;
    private final TransactionService transactionService;
    private final BadgeService badgeService;

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<AdminUserResponse> getUserAnalytics(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getUserAnalytics(id));
    }

    @PutMapping("/users/{id}/activate")
    public ResponseEntity<AdminUserResponse> activate(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.setUserActive(id, true));
    }

    @PutMapping("/users/{id}/deactivate")
    public ResponseEntity<AdminUserResponse> deactivate(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.setUserActive(id, false));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> platformStats() {
        return ResponseEntity.ok(adminService.getPlatformStats());
    }

    // Notifications
    @PostMapping("/notifications/send")
    public ResponseEntity<Map<String, String>> sendNotification(@RequestBody Map<String, String> body) {
        adminService.sendNotification(
            body.get("targetUserId"),
            body.get("title"),
            body.get("message"),
            body.getOrDefault("type", "INFO")
        );
        return ResponseEntity.ok(Map.of("message", "Notification sent successfully"));
    }

    // Marketplace management
    @PostMapping("/marketplace")
    public ResponseEntity<MarketplaceItemResponse> addItem(@RequestBody MarketplaceItemRequest req) {
        return ResponseEntity.status(201).body(marketplaceService.addItem(req));
    }

    @PutMapping("/marketplace/{id}")
    public ResponseEntity<MarketplaceItemResponse> updateItem(@PathVariable Long id, @RequestBody MarketplaceItemRequest req) {
        return ResponseEntity.ok(marketplaceService.updateItem(id, req));
    }

    @DeleteMapping("/marketplace/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        marketplaceService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }

    // Transactions monitoring
    @GetMapping("/transactions")
    public ResponseEntity<List<TransactionResponse>> allTransactions() {
        return ResponseEntity.ok(transactionService.getAllTransactions());
    }

    // Badge definitions management
    @PostMapping("/badges")
    public ResponseEntity<BadgeDefinitionResponse> createBadge(@RequestBody BadgeDefinitionRequest req) {
        return ResponseEntity.status(201).body(badgeService.createDefinition(req));
    }

    @DeleteMapping("/badges/{id}")
    public ResponseEntity<Void> deleteBadge(@PathVariable Long id) {
        badgeService.deleteDefinition(id);
        return ResponseEntity.noContent().build();
    }

    // Surveys admin view
    @GetMapping("/surveys")
    public ResponseEntity<List<Map<String, Object>>> allSurveys() {
        return ResponseEntity.ok(adminService.getAllSurveysAdmin());
    }

    // Goals admin view
    @GetMapping("/goals")
    public ResponseEntity<List<Map<String, Object>>> allGoals() {
        return ResponseEntity.ok(adminService.getAllGoalsAdmin());
    }
}
