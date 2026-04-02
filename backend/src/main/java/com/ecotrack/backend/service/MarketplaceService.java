package com.ecotrack.backend.service;

import com.ecotrack.backend.entity.MarketplaceItem;
import com.ecotrack.backend.entity.Transaction;
import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.repository.MarketplaceRepository;
import com.ecotrack.backend.repository.TransactionRepository;
import com.ecotrack.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MarketplaceService {

    private final MarketplaceRepository marketplaceRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository        userRepository;
    private final NotificationService   notificationService;

    public List<MarketplaceItem> getAllItems() {
        return marketplaceRepository.findAll();
    }

    /**
     * FIX 1: Removed credit check — every purchase is now always COMPLETED.
     *         Admin does not need to assign credits to users.
     * FIX 2: Sends a notification to the user on successful purchase.
     */
    public Transaction purchaseItem(Long userId, Long itemId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        MarketplaceItem item = marketplaceRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setItem(item);
        transaction.setAmountPaid(item.getCost() != null ? item.getCost() : 0.0);
        transaction.setItemName(item.getName());
        transaction.setStatus("COMPLETED");   // Always COMPLETED — no credit check

        Transaction saved = transactionRepository.save(transaction);

        // Notify the user about their successful purchase
        try {
            notificationService.notifyPurchase(
                user,
                item.getName(),
                item.getOffsetValue() != null ? item.getOffsetValue() : 0.0
            );
        } catch (Exception ignored) {
            // Notification failure must never roll back a successful purchase
        }

        return saved;
    }

    public List<Transaction> getUserHistory(Long userId) {
        return transactionRepository.findByUserId(userId);
    }
}
