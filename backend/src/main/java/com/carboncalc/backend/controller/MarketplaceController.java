package com.carboncalc.backend.controller;

import com.carboncalc.backend.dto.MarketplaceItemRequest;
import com.carboncalc.backend.dto.MarketplaceItemResponse;
import com.carboncalc.backend.service.MarketplaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marketplace")
@RequiredArgsConstructor
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    @GetMapping
    public ResponseEntity<List<MarketplaceItemResponse>> getAll() {
        return ResponseEntity.ok(marketplaceService.getAllItems());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MarketplaceItemResponse> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(marketplaceService.getItem(id));
    }

    // Admin endpoints
    @PostMapping
    public ResponseEntity<MarketplaceItemResponse> create(@Valid @RequestBody MarketplaceItemRequest req) {
        return ResponseEntity.status(201).body(marketplaceService.addItem(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MarketplaceItemResponse> update(@PathVariable Long id,
                                                          @Valid @RequestBody MarketplaceItemRequest req) {
        return ResponseEntity.ok(marketplaceService.updateItem(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        marketplaceService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }
}
