package com.carbon.carbon.repository;

import com.carbon.carbon.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    List<Transaction> findByUserId(Long userId);
    
    List<Transaction> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<Transaction> findByMarketplaceItemId(Long marketplaceItemId);
    
    List<Transaction> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    long countByUserId(Long userId);
}
