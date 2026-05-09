package com.carboncalc.app.repository;

import com.carboncalc.app.entity.MarketplaceItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarketplaceItemRepository extends JpaRepository<MarketplaceItem, Long> {
}