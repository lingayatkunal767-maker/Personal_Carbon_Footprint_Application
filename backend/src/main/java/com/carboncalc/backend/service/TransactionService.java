package com.carboncalc.backend.service;

import com.carboncalc.backend.dto.TransactionResponse;
import com.carboncalc.backend.entity.MarketplaceItem;
import com.carboncalc.backend.entity.Transaction;
import com.carboncalc.backend.entity.User;
import com.carboncalc.backend.repository.MarketplaceRepository;
import com.carboncalc.backend.repository.TransactionRepository;
import com.carboncalc.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final MarketplaceRepository marketplaceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public TransactionResponse purchase(Long itemId, Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        MarketplaceItem item = marketplaceRepository.findById(itemId)
            .orElseThrow(() -> new RuntimeException("Item not found"));

        Transaction tx = Transaction.builder()
            .user(user).item(item).amount(item.getPrice())
            .status("COMPLETED").createdAt(LocalDateTime.now())
            .build();
        Transaction saved = transactionRepository.save(tx);

        // Push purchase notification
        notificationService.push(userId,
            "Purchase Successful 🛒",
            "You purchased \"" + item.getItemName() + "\" for ₹" + item.getPrice() +
            ". This offsets " + item.getCarbonOffsetValue() + " kg CO₂.",
            "PURCHASE");

        return toDto(saved);
    }

    public List<TransactionResponse> getUserTransactions(Long userId) {
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream().map(this::toDto).toList();
    }

    public List<TransactionResponse> getAllTransactions() {
        return transactionRepository.findAll().stream().map(this::toDto).toList();
    }

    private TransactionResponse toDto(Transaction t) {
        return TransactionResponse.builder()
            .id(t.getId())
            .userId(t.getUser().getId())
            .userName(t.getUser().getEmail())
            .itemId(t.getItem().getId())
            .itemName(t.getItem().getItemName())
            .itemType(t.getItem().getItemType())
            .carbonOffsetValue(t.getItem().getCarbonOffsetValue())
            .amount(t.getAmount())
            .status(t.getStatus())
            .createdAt(t.getCreatedAt())
            .build();
    }
}
