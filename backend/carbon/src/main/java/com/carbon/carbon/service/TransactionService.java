package com.carbon.carbon.service;

import com.carbon.carbon.dto.TransactionDTO;
import com.carbon.carbon.entity.Marketplace;
import com.carbon.carbon.entity.Transaction;
import com.carbon.carbon.entity.User;
import com.carbon.carbon.repository.MarketplaceRepository;
import com.carbon.carbon.repository.TransactionRepository;
import com.carbon.carbon.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional(readOnly = true)
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final MarketplaceRepository marketplaceRepository;

    public TransactionService(TransactionRepository transactionRepository,
                              UserRepository userRepository,
                              MarketplaceRepository marketplaceRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.marketplaceRepository = marketplaceRepository;
    }

    /**
     * Get all transactions for a user
     */
    public List<TransactionDTO> getUserTransactions(Long userId) {
        log.debug("Fetching transactions for user ID: {}", userId);
        
        if (userId == null) {
            log.warn("User ID is required");
            throw new IllegalArgumentException("User ID is required");
        }

        return transactionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get transaction by ID
     */
    public TransactionDTO getTransactionById(Long transactionId) {
        log.debug("Fetching transaction with ID: {}", transactionId);
        
        return transactionRepository.findById(transactionId)
                .map(this::convertToDTO)
                .orElseThrow(() -> {
                    log.warn("Transaction not found with ID: {}", transactionId);
                    return new RuntimeException("Transaction not found");
                });
    }

    /**
     * Create a new transaction (purchase)
     */
    @Transactional
    public TransactionDTO createTransaction(Long userId, Long marketplaceItemId, BigDecimal amount) {
        log.info("Creating transaction for user ID: {} for marketplace item ID: {} with amount: {}", 
                userId, marketplaceItemId, amount);
        
        // Validate inputs
        if (userId == null) {
            log.warn("User ID is required");
            throw new IllegalArgumentException("User ID is required");
        }
        
        if (marketplaceItemId == null) {
            log.warn("Marketplace item ID is required");
            throw new IllegalArgumentException("Marketplace item ID is required");
        }
        
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            log.warn("Transaction amount must be greater than 0");
            throw new IllegalArgumentException("Transaction amount must be greater than 0");
        }

        // Verify user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", userId);
                    return new RuntimeException("User not found");
                });

        // Verify marketplace item exists
        Marketplace marketplace = marketplaceRepository.findById(marketplaceItemId)
                .orElseThrow(() -> {
                    log.warn("Marketplace item not found with ID: {}", marketplaceItemId);
                    return new RuntimeException("Marketplace item not found");
                });

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setMarketplaceItem(marketplace);
        transaction.setAmount(amount);

        Transaction saved = transactionRepository.save(transaction);
        log.info("Transaction created with ID: {}", saved.getId());
        return convertToDTO(saved);
    }

    /**
     * Get total transaction amount for a user
     */
    public BigDecimal getUserTotalTransactions(Long userId) {
        log.debug("Calculating total transaction amount for user ID: {}", userId);
        
        if (userId == null) {
            log.warn("User ID is required");
            throw new IllegalArgumentException("User ID is required");
        }

        return transactionRepository.findByUserId(userId)
                .stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Count transactions for a user
     */
    public long getUserTransactionCount(Long userId) {
        log.debug("Counting transactions for user ID: {}", userId);
        
        if (userId == null) {
            log.warn("User ID is required");
            throw new IllegalArgumentException("User ID is required");
        }

        return transactionRepository.countByUserId(userId);
    }

    /**
     * Get transactions within a date range
     */
    public List<TransactionDTO> getTransactionsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        log.debug("Fetching transactions between {} and {}", startDate, endDate);
        
        if (startDate == null || endDate == null) {
            log.warn("Both start date and end date are required");
            throw new IllegalArgumentException("Both start date and end date are required");
        }
        
        if (startDate.isAfter(endDate)) {
            log.warn("Start date cannot be after end date");
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        return transactionRepository.findByCreatedAtBetween(startDate, endDate)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convert entity to DTO
     */
    private TransactionDTO convertToDTO(Transaction transaction) {
        return new TransactionDTO(
                transaction.getId(),
                transaction.getUser().getId(),
                transaction.getMarketplaceItem().getId(),
                transaction.getMarketplaceItem().getItemName(),
                transaction.getAmount(),
                transaction.getCreatedAt()
        );
    }
}
