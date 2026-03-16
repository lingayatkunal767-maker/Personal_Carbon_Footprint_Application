package com.carboncalc.app.controller;

import com.carboncalc.app.dto.common.ApiResponse;
import com.carboncalc.app.dto.common.MessageResponse;
import com.carboncalc.app.dto.marketplace.MarketplaceItemRequest;
import com.carboncalc.app.dto.marketplace.MarketplaceItemResponse;
import com.carboncalc.app.service.marketplace.AdminMarketplaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/marketplace")
@RequiredArgsConstructor
public class AdminMarketplaceController {

    private final AdminMarketplaceService adminMarketplaceService;

    @PostMapping
    public ApiResponse<MarketplaceItemResponse> createItem(@RequestBody MarketplaceItemRequest request) {
        return ApiResponse.<MarketplaceItemResponse>builder()
                .success(true)
                .message("Marketplace item created successfully")
                .data(adminMarketplaceService.createItem(request))
                .build();
    }

    @DeleteMapping("/{itemId}")
    public ApiResponse<MessageResponse> deleteItem(@PathVariable Long itemId) {
        adminMarketplaceService.deleteItem(itemId);
        return ApiResponse.<MessageResponse>builder()
                .success(true)
                .message("Marketplace item deleted successfully")
                .data(MessageResponse.builder().message("Item deleted").build())
                .build();
    }
}