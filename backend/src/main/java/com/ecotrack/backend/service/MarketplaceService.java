package com.ecotrack.backend.service;


import com.ecotrack.backend.entity.MarketplaceItem;
import com.ecotrack.backend.entity.Transaction;
import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.repository.MarketplaceRepository;
import com.ecotrack.backend.repository.TransactionRepository;
import com.ecotrack.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MarketplaceService {
    @Autowired
    private MarketplaceRepository marketplaceRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    public List<MarketplaceItem> getAllItems() {
        return marketplaceRepository.findAll();
    }


    public Transaction purchaseItem(Long userId, Long itemId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        MarketplaceItem item = marketplaceRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setItem(item);
        transaction.setAmountPaid(item.getCost());
        transaction.setItemName(item.getName()); // Ensure name is stored for history

        // 1. Check if user has enough credits
        if (user.getCredits() >= item.getCost()) {
            // 2. Deduct credits
            user.setCredits(user.getCredits() - item.getCost());
            userRepository.save(user);

            // 3. Set Status to COMPLETED
            transaction.setStatus("COMPLETED");
        } else {
            // 4. Set Status to UNSUCCESSFUL if credits are low
            transaction.setStatus("UNSUCCESSFUL");
            // We still save the transaction so the user sees the failed attempt in history
        }

        return transactionRepository.save(transaction);
    }

    public List<Transaction> getUserHistory(Long userId) {
        return transactionRepository.findByUserId(userId);
    }
}