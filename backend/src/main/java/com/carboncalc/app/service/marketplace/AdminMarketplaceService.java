package com.carboncalc.app.service.marketplace;

import com.carboncalc.app.dto.marketplace.MarketplaceItemRequest;
import com.carboncalc.app.dto.marketplace.MarketplaceItemResponse;
import com.carboncalc.app.entity.MarketplaceItem;
import com.carboncalc.app.repository.MarketplaceItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminMarketplaceService {

    private final MarketplaceItemRepository marketplaceItemRepository;

    public MarketplaceItemResponse createItem(MarketplaceItemRequest request) {
        MarketplaceItem item = MarketplaceItem.builder()
                .itemName(request.getItemName())
                .itemType(request.getItemType())
                .price(request.getPrice())
                .description(request.getDescription())
                .createdAt(LocalDateTime.now())
                .build();

        item = marketplaceItemRepository.save(item);

        return MarketplaceItemResponse.builder()
                .id(item.getId())
                .itemName(item.getItemName())
                .itemType(item.getItemType())
                .price(item.getPrice())
                .description(item.getDescription())
                .build();
    }

    public void deleteItem(Long itemId) {
        marketplaceItemRepository.deleteById(itemId);
    }
}