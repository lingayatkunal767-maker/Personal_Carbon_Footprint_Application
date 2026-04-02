package com.ecotrack.backend.controller;

import com.ecotrack.backend.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminTransactionController {

    private final TransactionService service;

    @GetMapping("/transactions")
    public Map<String, Object> getTransactions(
            @RequestParam(defaultValue = "daily") String period
    ) {
        return service.getTransactionAnalytics(period);
    }
}