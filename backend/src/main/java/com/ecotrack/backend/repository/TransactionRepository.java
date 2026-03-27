package com.ecotrack.backend.repository;


import com.ecotrack.backend.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    // Custom query to find all purchases made by a specific User ID
    List<Transaction> findByUserId(Long userId);
}