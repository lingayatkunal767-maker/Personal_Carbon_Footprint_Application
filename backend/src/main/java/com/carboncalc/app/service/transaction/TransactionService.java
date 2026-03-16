package com.carboncalc.app.service.transaction;

import com.carboncalc.app.dto.transaction.TransactionResponse;
import com.carboncalc.app.entity.User;
import com.carboncalc.app.repository.TransactionRepository;
import com.carboncalc.app.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserService userService;

    public List<TransactionResponse> getTransactions(Long userId) {
        User user = userService.getUserEntity(userId);

        return transactionRepository.findByUser(user)
                .stream()
                .map(tx -> TransactionResponse.builder()
                        .id(tx.getId())
                        .itemName(tx.getMarketplaceItem().getItemName())
                        .amount(tx.getAmount())
                        .status(tx.getStatus())
                        .createdAt(tx.getCreatedAt())
                        .build())
                .toList();
    }
}