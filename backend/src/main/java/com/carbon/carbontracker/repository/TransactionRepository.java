package com.carbon.carbontracker.repository;

import com.carbon.carbontracker.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserId(Long userId);
    List<Transaction> findAllByOrderByCreatedAtDesc();
    List<Transaction> findByUserIdAndMarketplaceItem_ItemNameContainingIgnoreCase(Long userId, String keyword);
}