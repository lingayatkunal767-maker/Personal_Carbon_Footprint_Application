package com.carbon.carbontracker.service;

import com.carbon.carbontracker.dto.TransactionRequestDTO;
import com.carbon.carbontracker.dto.TransactionResponseDTO;
import com.carbon.carbontracker.model.Transaction;
import com.carbon.carbontracker.repository.TransactionRepository;
import com.carbon.carbontracker.repository.MarketplaceRepository;
import com.carbon.carbontracker.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import com.carbon.carbontracker.model.User;
import com.carbon.carbontracker.model.MarketplaceItem;
@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final MarketplaceRepository marketplaceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // USER: Purchase item
    @Transactional
    public Transaction purchaseItem(TransactionRequestDTO dto) {
        User user = userRepository.findById(dto.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));

        MarketplaceItem item = marketplaceRepository.findById(dto.getMarketplaceItemId())
            .orElseThrow(() -> new RuntimeException("Item not found"));

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setMarketplaceItem(item);
        transaction.setAmount(item.getPrice());
        transaction.setStatus("SUCCESS");

        Transaction saved = transactionRepository.save(transaction);

        // Trigger purchase notification automatically
        notificationService.createPurchaseNotification(user, item);

        return saved;
    }

    // USER: Get transaction history
    public List<TransactionResponseDTO> getUserTransactions(Long userId) {
        return transactionRepository.findByUserId(userId).stream()
            .map(t -> new TransactionResponseDTO(
                t.getId(),
                t.getMarketplaceItem().getItemName(),
                t.getMarketplaceItem().getItemType(),
                1,
                t.getAmount(),
                t.getMarketplaceItem().getCarbonOffsetValue(),
                t.getStatus(),
                t.getCreatedAt()
            )).collect(Collectors.toList());
    }

    // USER: Get single transaction
    public Transaction getTransactionById(Long id) {
        return transactionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Transaction not found"));
    }

    // ADMIN: Get all transactions
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAllByOrderByCreatedAtDesc();
    }

    // ADMIN: Filter/search transactions
    public List<Transaction> getTransactionsByUser(Long userId) {
        return transactionRepository.findByUserId(userId);
    }
}