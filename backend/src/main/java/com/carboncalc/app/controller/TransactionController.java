package com.carboncalc.app.controller;

import com.carboncalc.app.dto.common.ApiResponse;
import com.carboncalc.app.dto.transaction.TransactionResponse;
import com.carboncalc.app.service.transaction.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping("/{userId}")
    public ApiResponse<List<TransactionResponse>> getTransactions(@PathVariable Long userId) {
        return ApiResponse.<List<TransactionResponse>>builder()
                .success(true)
                .message("Transactions fetched successfully")
                .data(transactionService.getTransactions(userId))
                .build();
    }
}