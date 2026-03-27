package com.ecotrack.backend.controller;


import com.ecotrack.backend.entity.MarketplaceItem;
import com.ecotrack.backend.entity.Transaction;
import com.ecotrack.backend.service.MarketplaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marketplace")
public class MarketplaceController {
    @Autowired
    private MarketplaceService marketplaceService;

    @GetMapping("/items")
    public ResponseEntity<List<MarketplaceItem>> getItems() {
        return ResponseEntity.ok(marketplaceService.getAllItems());
    }

    @PostMapping("/purchase")
    public ResponseEntity<Transaction> purchase(@RequestParam Long userId, @RequestParam Long itemId) {
        return ResponseEntity.ok(marketplaceService.purchaseItem(userId, itemId));
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<Transaction>> getHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(marketplaceService.getUserHistory(userId));
    }
}
