package com.carboncalc.backend.repository;

import com.carboncalc.backend.entity.MarketplaceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MarketplaceRepository extends JpaRepository<MarketplaceItem, Long> {
}
