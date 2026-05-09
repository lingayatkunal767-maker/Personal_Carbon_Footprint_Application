package com.carboncalc.app.controller;

import com.carboncalc.app.dto.common.ApiResponse;
import com.carboncalc.app.dto.marketplace.MarketplaceItemResponse;
import com.carboncalc.app.dto.marketplace.PurchaseRequest;
import com.carboncalc.app.dto.marketplace.PurchaseResponse;
import com.carboncalc.app.service.marketplace.MarketplaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marketplace")
@RequiredArgsConstructor
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    @GetMapping
    public ApiResponse<List<MarketplaceItemResponse>> getItems() {
        return ApiResponse.<List<MarketplaceItemResponse>>builder()
                .success(true)
                .message("Marketplace items fetched successfully")
                .data(marketplaceService.getAllItems())
                .build();
    }

    @PostMapping("/{userId}/purchase")
    public ApiResponse<PurchaseResponse> purchase(@PathVariable Long userId,
                                                  @RequestBody PurchaseRequest request) {
        return ApiResponse.<PurchaseResponse>builder()
                .success(true)
                .message("Purchase completed successfully")
                .data(marketplaceService.purchase(userId, request))
                .build();
    }
}