package com.ecotrack.backend.controller;

import com.ecotrack.backend.entity.MarketplaceItem;
import com.ecotrack.backend.entity.Transaction;
import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.service.MarketplaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/marketplace")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    // GET /api/marketplace/items  — public, no auth needed for browsing
    @GetMapping("/items")
    public ResponseEntity<List<MarketplaceItem>> getItems() {
        return ResponseEntity.ok(marketplaceService.getAllItems());
    }

    /**
     * POST /api/marketplace/purchase?userId=X&itemId=Y
     *
     * Uses the authenticated user's id to prevent purchasing as another user.
     * Always returns COMPLETED — no credit balance check.
     */
    @PostMapping("/purchase")
    public ResponseEntity<?> purchase(
            @AuthenticationPrincipal User authUser,
            @RequestParam Long userId,
            @RequestParam Long itemId) {
        try {
            Long effectiveUserId = authUser != null ? authUser.getId() : userId;
            Transaction tx = marketplaceService.purchaseItem(effectiveUserId, itemId);
            return ResponseEntity.ok(tx);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/marketplace/history/{userId}  — user's transaction history
    @GetMapping("/history/{userId}")
    public ResponseEntity<List<Transaction>> getHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(marketplaceService.getUserHistory(userId));
    }
}
