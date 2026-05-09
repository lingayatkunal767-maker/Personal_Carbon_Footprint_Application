package com.carboncalc.app.repository;

import com.carboncalc.app.entity.Transaction;
import com.carboncalc.app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUser(User user);
}