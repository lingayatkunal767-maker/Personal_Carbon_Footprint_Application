package com.carbon.carbon.controller;

import com.carbon.carbon.dto.TransactionDTO;
import com.carbon.carbon.service.TransactionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/transactions")
@CrossOrigin
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    /**
     * Get all transactions for current user
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> getUserTransactions(@PathVariable Long userId) {
        try {
            List<TransactionDTO> transactions = transactionService.getUserTransactions(userId);
            return ResponseEntity.ok(transactions);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid user ID: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching user transactions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch transactions"));
        }
    }

    /**
     * Get transaction by ID
     */
    @GetMapping("/{transactionId}")
    public ResponseEntity<?> getTransactionById(@PathVariable Long transactionId) {
        try {
            TransactionDTO transaction = transactionService.getTransactionById(transactionId);
            return ResponseEntity.ok(transaction);
        } catch (RuntimeException e) {
            log.warn("Transaction not found: {}", transactionId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Transaction not found"));
        } catch (Exception e) {
            log.error("Error fetching transaction", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch transaction"));
        }
    }

    /**
     * Create new transaction (purchase)
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> createTransaction(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            Long marketplaceItemId = Long.valueOf(request.get("marketplaceItemId").toString());
            BigDecimal amount = new BigDecimal(request.get("amount").toString());

            TransactionDTO transaction = transactionService.createTransaction(userId, marketplaceItemId, amount);
            return ResponseEntity.status(HttpStatus.CREATED).body(transaction);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid input for transaction creation: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (RuntimeException e) {
            log.warn("Error creating transaction: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating transaction", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to create transaction"));
        }
    }

    /**
     * Get total transaction amount for a user
     */
    @GetMapping("/user/{userId}/total")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> getUserTotalTransactions(@PathVariable Long userId) {
        try {
            BigDecimal total = transactionService.getUserTotalTransactions(userId);
            return ResponseEntity.ok(Map.of("userId", userId, "totalAmount", total));
        } catch (IllegalArgumentException e) {
            log.warn("Invalid user ID: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error calculating total transactions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to calculate total"));
        }
    }

    /**
     * Get transaction count for a user
     */
    @GetMapping("/user/{userId}/count")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> getUserTransactionCount(@PathVariable Long userId) {
        try {
            long count = transactionService.getUserTransactionCount(userId);
            return ResponseEntity.ok(Map.of("userId", userId, "count", count));
        } catch (IllegalArgumentException e) {
            log.warn("Invalid user ID: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error counting user transactions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to count transactions"));
        }
    }

    /**
     * Get transactions within date range
     */
    @GetMapping("/range")
    public ResponseEntity<?> getTransactionsByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDateTime start = LocalDateTime.parse(startDate);
            LocalDateTime end = LocalDateTime.parse(endDate);
            List<TransactionDTO> transactions = transactionService.getTransactionsByDateRange(start, end);
            return ResponseEntity.ok(transactions);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid date range: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching transactions by date range", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch transactions"));
        }
    }
}
