package com.carbon.carbontracker.controller;

import com.carbon.carbontracker.dto.TransactionRequestDTO;
import com.carbon.carbontracker.dto.TransactionResponseDTO;
import com.carbon.carbontracker.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.carbon.carbontracker.model.Transaction;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TransactionController {

    private final TransactionService transactionService;

    // USER: Purchase item
    @PostMapping
    public ResponseEntity<Transaction> purchase(@RequestBody TransactionRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.purchaseItem(dto));
    }

    // USER: Get transaction history
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TransactionResponseDTO>> getUserTransactions(@PathVariable Long userId) {
        return ResponseEntity.ok(transactionService.getUserTransactions(userId));
    }

    // USER: Get transaction details
    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransactionById(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.getTransactionById(id));
    }

    // ADMIN: Get all transactions
    @GetMapping("/admin/all")
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        return ResponseEntity.ok(transactionService.getAllTransactions());
    }

    // ADMIN: Track purchases by user
    @GetMapping("/admin/user/{userId}")
    public ResponseEntity<List<Transaction>> getTransactionsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(transactionService.getTransactionsByUser(userId));
    }
}