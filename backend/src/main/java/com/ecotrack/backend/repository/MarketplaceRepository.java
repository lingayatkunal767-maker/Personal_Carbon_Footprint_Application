package com.ecotrack.backend.repository;


import com.ecotrack.backend.entity.MarketplaceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MarketplaceRepository extends JpaRepository<MarketplaceItem, Long> {
    // Standard CRUD operations are inherited from JpaRepository
}