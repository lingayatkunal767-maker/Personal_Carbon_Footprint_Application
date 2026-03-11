package com.carbon.carbon.service;

import com.carbon.carbon.dto.MarketplaceDTO;
import com.carbon.carbon.entity.Marketplace;
import com.carbon.carbon.repository.MarketplaceRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional(readOnly = true)
public class MarketplaceService {

    private final MarketplaceRepository marketplaceRepository;

    public MarketplaceService(MarketplaceRepository marketplaceRepository) {
        this.marketplaceRepository = marketplaceRepository;
    }

    /**
     * Get all marketplace items
     */
    public List<MarketplaceDTO> getAllItems() {
        log.debug("Fetching all marketplace items");
        return marketplaceRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get marketplace item by ID
     */
    public MarketplaceDTO getItemById(Long id) {
        log.debug("Fetching marketplace item with ID: {}", id);
        return marketplaceRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> {
                    log.warn("Marketplace item not found with ID: {}", id);
                    return new RuntimeException("Marketplace item not found");
                });
    }

    /**
     * Create new marketplace item
     */
    @Transactional
    public MarketplaceDTO createItem(MarketplaceDTO itemDTO) {
        log.info("Creating new marketplace item: {}", itemDTO.getItemName());
        
        if (itemDTO.getItemName() == null || itemDTO.getItemName().trim().isEmpty()) {
            log.warn("Item name is required");
            throw new IllegalArgumentException("Item name is required");
        }
        
        if (itemDTO.getItemPrice() == null || itemDTO.getItemPrice().compareTo(BigDecimal.ZERO) <= 0) {
            log.warn("Item price must be greater than 0");
            throw new IllegalArgumentException("Item price must be greater than 0");
        }

        Marketplace marketplace = new Marketplace();
        marketplace.setItemName(itemDTO.getItemName().trim());
        marketplace.setItemPrice(itemDTO.getItemPrice());
        marketplace.setDescription(itemDTO.getDescription());

        Marketplace saved = marketplaceRepository.save(marketplace);
        log.info("Marketplace item created with ID: {}", saved.getId());
        return convertToDTO(saved);
    }

    /**
     * Update marketplace item
     */
    @Transactional
    public MarketplaceDTO updateItem(Long id, MarketplaceDTO itemDTO) {
        log.info("Updating marketplace item with ID: {}", id);
        
        Marketplace marketplace = marketplaceRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Marketplace item not found with ID: {}", id);
                    return new RuntimeException("Marketplace item not found");
                });

        if (itemDTO.getItemName() != null && !itemDTO.getItemName().trim().isEmpty()) {
            marketplace.setItemName(itemDTO.getItemName().trim());
        }
        
        if (itemDTO.getItemPrice() != null && itemDTO.getItemPrice().compareTo(BigDecimal.ZERO) > 0) {
            marketplace.setItemPrice(itemDTO.getItemPrice());
        }
        
        if (itemDTO.getDescription() != null) {
            marketplace.setDescription(itemDTO.getDescription());
        }

        Marketplace updated = marketplaceRepository.save(marketplace);
        log.info("Marketplace item updated successfully");
        return convertToDTO(updated);
    }

    /**
     * Delete marketplace item
     */
    @Transactional
    public void deleteItem(Long id) {
        log.info("Deleting marketplace item with ID: {}", id);
        
        if (!marketplaceRepository.existsById(id)) {
            log.warn("Marketplace item not found with ID: {}", id);
            throw new RuntimeException("Marketplace item not found");
        }
        
        marketplaceRepository.deleteById(id);
        log.info("Marketplace item deleted successfully");
    }

    /**
     * Convert entity to DTO
     */
    private MarketplaceDTO convertToDTO(Marketplace marketplace) {
        return new MarketplaceDTO(
                marketplace.getId(),
                marketplace.getItemName(),
                marketplace.getItemPrice(),
                marketplace.getDescription(),
                marketplace.getCreatedAt()
        );
    }
}
