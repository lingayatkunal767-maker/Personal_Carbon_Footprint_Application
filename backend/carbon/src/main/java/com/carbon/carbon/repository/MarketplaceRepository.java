package com.carbon.carbon.repository;

import com.carbon.carbon.entity.Marketplace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MarketplaceRepository extends JpaRepository<Marketplace, Long> {
    
    Optional<Marketplace> findByItemName(String itemName);
    
    List<Marketplace> findAllByOrderByCreatedAtDesc();
}
