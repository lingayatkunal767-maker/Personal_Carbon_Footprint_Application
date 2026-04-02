package com.carboncalc.backend.controller;

import com.carboncalc.backend.dto.TransactionResponse;
import com.carboncalc.backend.repository.UserRepository;
import com.carboncalc.backend.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final UserRepository userRepository;

    private Long currentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found")).getId();
    }

    @PostMapping("/{itemId}")
    public ResponseEntity<TransactionResponse> purchase(@PathVariable("itemId") Long itemId) {
        return ResponseEntity.status(201).body(transactionService.purchase(itemId, currentUserId()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<TransactionResponse>> myTransactions() {
        return ResponseEntity.ok(transactionService.getUserTransactions(currentUserId()));
    }

    @GetMapping
    public ResponseEntity<List<TransactionResponse>> allTransactions() {
        return ResponseEntity.ok(transactionService.getAllTransactions());
    }
}
