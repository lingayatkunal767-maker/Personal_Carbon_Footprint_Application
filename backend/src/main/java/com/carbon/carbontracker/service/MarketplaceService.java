package com.carbon.carbontracker.service;

import com.carbon.carbontracker.dto.MarketplaceItemDTO;
import com.carbon.carbontracker.model.MarketplaceItem;
import com.carbon.carbontracker.repository.MarketplaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MarketplaceService {

    private final MarketplaceRepository marketplaceRepository;

    // ============================
    // 👤 USER: Get all items
    // ============================
    public List<MarketplaceItemDTO> getAllItems() {
        return marketplaceRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    // ============================
    // 👤 USER: Get single item
    // ============================
    public MarketplaceItemDTO getItemById(Long id) {
        MarketplaceItem item = marketplaceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found with id: " + id));

        return mapToDTO(item);
    }

    // ============================
    // 👨‍💼 ADMIN: Create item
    // ============================
    public MarketplaceItemDTO createItem(MarketplaceItemDTO dto) {
        MarketplaceItem item = mapToEntity(dto);
        return mapToDTO(marketplaceRepository.save(item));
    }

    // ============================
    // 👨‍💼 ADMIN: Update item
    // ============================
    public MarketplaceItemDTO updateItem(Long id, MarketplaceItemDTO dto) {
        MarketplaceItem item = marketplaceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found with id: " + id));

        item.setItemName(dto.getItemName());
        item.setItemType(dto.getItemType());
        item.setPrice(dto.getPrice());
        item.setDescription(dto.getDescription());
        item.setCarbonOffsetValue(dto.getCarbonOffsetValue());

        return mapToDTO(marketplaceRepository.save(item));
    }

    // ============================
    // 👨‍💼 ADMIN: Delete item
    // ============================
    public void deleteItem(Long id) {
        if (!marketplaceRepository.existsById(id)) {
            throw new RuntimeException("Item not found with id: " + id);
        }
        marketplaceRepository.deleteById(id);
    }

    // ============================
    // 🔁 MAPPING METHODS
    // ============================

    private MarketplaceItem mapToEntity(MarketplaceItemDTO dto) {
        return MarketplaceItem.builder()
                .itemName(dto.getItemName())
                .itemType(dto.getItemType())
                .price(dto.getPrice())
                .description(dto.getDescription())
                .carbonOffsetValue(dto.getCarbonOffsetValue())
                .build();
    }

    private MarketplaceItemDTO mapToDTO(MarketplaceItem item) {
        return MarketplaceItemDTO.builder()
                .id(item.getId())
                .itemName(item.getItemName())
                .itemType(item.getItemType())
                .price(item.getPrice())
                .description(item.getDescription())
                .carbonOffsetValue(item.getCarbonOffsetValue())
                .build();
    }
}