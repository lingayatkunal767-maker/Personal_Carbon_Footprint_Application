package com.carbon.carbon.controller;

import com.carbon.carbon.dto.MarketplaceDTO;
import com.carbon.carbon.service.MarketplaceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/marketplace")
@CrossOrigin
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    public MarketplaceController(MarketplaceService marketplaceService) {
        this.marketplaceService = marketplaceService;
    }

    /**
     * Get all marketplace items
     */
    @GetMapping
    public ResponseEntity<?> getAllItems() {
        try {
            List<MarketplaceDTO> items = marketplaceService.getAllItems();
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            log.error("Error fetching marketplace items", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch marketplace items"));
        }
    }

    /**
     * Get marketplace item by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getItemById(@PathVariable Long id) {
        try {
            MarketplaceDTO item = marketplaceService.getItemById(id);
            return ResponseEntity.ok(item);
        } catch (RuntimeException e) {
            log.warn("Marketplace item not found: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Marketplace item not found"));
        } catch (Exception e) {
            log.error("Error fetching marketplace item", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch marketplace item"));
        }
    }

    /**
     * Create new marketplace item (Admin only)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createItem(@RequestBody MarketplaceDTO itemDTO) {
        try {
            MarketplaceDTO created = marketplaceService.createItem(itemDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid input for marketplace item creation: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating marketplace item", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to create marketplace item"));
        }
    }

    /**
     * Update marketplace item (Admin only)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateItem(@PathVariable Long id, @RequestBody MarketplaceDTO itemDTO) {
        try {
            MarketplaceDTO updated = marketplaceService.updateItem(id, itemDTO);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            log.warn("Marketplace item not found for update: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Marketplace item not found"));
        } catch (Exception e) {
            log.error("Error updating marketplace item", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to update marketplace item"));
        }
    }

    /**
     * Delete marketplace item (Admin only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteItem(@PathVariable Long id) {
        try {
            marketplaceService.deleteItem(id);
            return ResponseEntity.ok(Map.of("message", "Marketplace item deleted successfully"));
        } catch (RuntimeException e) {
            log.warn("Marketplace item not found for deletion: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Marketplace item not found"));
        } catch (Exception e) {
            log.error("Error deleting marketplace item", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to delete marketplace item"));
        }
    }
}
