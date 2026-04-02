package com.ecotrack.backend.service;

import com.ecotrack.backend.entity.Transaction;
import com.ecotrack.backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository repo;

    public Map<String, Object> getTransactionAnalytics(String period) {

        List<Transaction> all = repo.findAll();

        // KPIs
        long totalTx = all.size();
        long completedTx = all.stream()
                .filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus()))
                .count();

        double totalRevenue = all.stream()
                .filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus()))
                .mapToDouble(t -> t.getAmountPaid() != null ? t.getAmountPaid() : 0)
                .sum();

        // Per day
        Map<String, Long> perDay = all.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getTransactionDate().toLocalDate().toString(),
                        Collectors.counting()
                ));

        // Per product
        Map<String, List<Transaction>> grouped = all.stream()
                .collect(Collectors.groupingBy(Transaction::getItemName));

        List<Map<String, Object>> perProduct = new ArrayList<>();

        for (String product : grouped.keySet()) {
            List<Transaction> list = grouped.get(product);

            long completed = list.stream()
                    .filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus()))
                    .count();

            double revenue = list.stream()
                    .filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus()))
                    .mapToDouble(t -> t.getAmountPaid() != null ? t.getAmountPaid() : 0)
                    .sum();

            Map<String, Object> m = new HashMap<>();
            m.put("productName", product);
            m.put("totalBuyers", list.size());
            m.put("completedCount", completed);
            m.put("totalRevenue", revenue);

            perProduct.add(m);
        }

        // Transaction list
        List<Map<String, Object>> txList = all.stream().map(t -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", t.getId());
            m.put("userName", t.getUser().getName());
            m.put("userEmail", t.getUser().getEmail());
            m.put("productName", t.getItemName());
            m.put("amount", t.getAmountPaid());
            m.put("status", t.getStatus());
            m.put("date", t.getTransactionDate());
            return m;
        }).collect(Collectors.toList());

        // Final response
        Map<String, Object> res = new HashMap<>();
        res.put("totalTx", totalTx);
        res.put("completedTx", completedTx);
        res.put("totalRevenue", totalRevenue);
        res.put("perDay", perDay);
        res.put("perProduct", perProduct);
        res.put("transactions", txList);

        return res;
    }
}