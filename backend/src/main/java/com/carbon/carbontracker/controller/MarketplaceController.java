package com.carbon.carbontracker.controller;

import com.carbon.carbontracker.dto.MarketplaceItemDTO;
import com.carbon.carbontracker.service.MarketplaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marketplace")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    // ============================
    // 👤 USER: Get all items
    // ============================
    @GetMapping
    public ResponseEntity<List<MarketplaceItemDTO>> getAllItems() {
        return ResponseEntity.ok(marketplaceService.getAllItems());
    }

    // ============================
    // 👤 USER: Get single item
    // ============================
    @GetMapping("/{id}")
    public ResponseEntity<MarketplaceItemDTO> getItemById(@PathVariable Long id) {
        return ResponseEntity.ok(marketplaceService.getItemById(id));
    }

    // ============================
    // 👨‍💼 ADMIN: Create item
    // ============================
    @PostMapping
    public ResponseEntity<MarketplaceItemDTO> createItem(@RequestBody MarketplaceItemDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(marketplaceService.createItem(dto));
    }

    // ============================
    // 👨‍💼 ADMIN: Edit item
    // ============================
    @PutMapping("/{id}")
    public ResponseEntity<MarketplaceItemDTO> updateItem(@PathVariable Long id,
                                                         @RequestBody MarketplaceItemDTO dto) {
        return ResponseEntity.ok(marketplaceService.updateItem(id, dto));
    }

    // ============================
    // 👨‍💼 ADMIN: Delete item
    // ============================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        marketplaceService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }

    // ============================
    // 👨‍💼 ADMIN: Get all items
    // ============================
    @GetMapping("/admin/all")
    public ResponseEntity<List<MarketplaceItemDTO>> getAllItemsForAdmin() {
        return ResponseEntity.ok(marketplaceService.getAllItems());
    }
}