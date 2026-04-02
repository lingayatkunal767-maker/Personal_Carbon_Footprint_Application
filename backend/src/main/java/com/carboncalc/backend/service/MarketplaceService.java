package com.carboncalc.backend.service;

import com.carboncalc.backend.dto.MarketplaceItemRequest;
import com.carboncalc.backend.dto.MarketplaceItemResponse;
import com.carboncalc.backend.entity.MarketplaceItem;
import com.carboncalc.backend.repository.MarketplaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MarketplaceService {

    private final MarketplaceRepository marketplaceRepository;

    public List<MarketplaceItemResponse> getAllItems() {
        return marketplaceRepository.findAll().stream().map(this::toDto).toList();
    }

    public MarketplaceItemResponse getItem(Long id) {
        return toDto(marketplaceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Item not found")));
    }

    @Transactional
    public MarketplaceItemResponse addItem(MarketplaceItemRequest req) {
        MarketplaceItem item = MarketplaceItem.builder()
            .itemName(req.getItemName()).itemType(req.getItemType())
            .price(req.getPrice()).description(req.getDescription())
            .carbonOffsetValue(req.getCarbonOffsetValue())
            .createdAt(LocalDateTime.now()).build();
        return toDto(marketplaceRepository.save(item));
    }

    @Transactional
    public MarketplaceItemResponse updateItem(Long id, MarketplaceItemRequest req) {
        MarketplaceItem item = marketplaceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Item not found"));
        item.setItemName(req.getItemName());
        item.setItemType(req.getItemType());
        item.setPrice(req.getPrice());
        item.setDescription(req.getDescription());
        item.setCarbonOffsetValue(req.getCarbonOffsetValue());
        return toDto(marketplaceRepository.save(item));
    }

    @Transactional
    public void deleteItem(Long id) {
        marketplaceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Item not found"));
        marketplaceRepository.deleteById(id);
    }

    private MarketplaceItemResponse toDto(MarketplaceItem i) {
        return MarketplaceItemResponse.builder()
            .id(i.getId()).itemName(i.getItemName()).itemType(i.getItemType())
            .price(i.getPrice()).description(i.getDescription())
            .carbonOffsetValue(i.getCarbonOffsetValue()).createdAt(i.getCreatedAt())
            .build();
    }
}
