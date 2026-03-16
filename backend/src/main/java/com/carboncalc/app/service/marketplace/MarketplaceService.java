package com.carboncalc.app.service.marketplace;

import com.carboncalc.app.dto.marketplace.MarketplaceItemResponse;
import com.carboncalc.app.dto.marketplace.PurchaseRequest;
import com.carboncalc.app.dto.marketplace.PurchaseResponse;
import com.carboncalc.app.entity.MarketplaceItem;
import com.carboncalc.app.entity.Transaction;
import com.carboncalc.app.entity.User;
import com.carboncalc.app.enums.TransactionStatus;
import com.carboncalc.app.repository.MarketplaceItemRepository;
import com.carboncalc.app.repository.TransactionRepository;
import com.carboncalc.app.service.notification.NotificationService;
import com.carboncalc.app.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MarketplaceService {

    private final MarketplaceItemRepository marketplaceItemRepository;
    private final TransactionRepository transactionRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    public List<MarketplaceItemResponse> getAllItems() {
        return marketplaceItemRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public PurchaseResponse purchase(Long userId, PurchaseRequest request) {
        User user = userService.getUserEntity(userId);

        MarketplaceItem item = marketplaceItemRepository.findById(request.getMarketplaceItemId())
                .orElseThrow(() -> new RuntimeException("Marketplace item not found"));

        Transaction transaction = Transaction.builder()
                .user(user)
                .marketplaceItem(item)
                .amount(item.getPrice())
                .status(TransactionStatus.SUCCESS)
                .createdAt(LocalDateTime.now())
                .build();

        transaction = transactionRepository.save(transaction);

        notificationService.createGeneralNotification(
                user,
                "Purchase successful for item: " + item.getItemName()
        );

        return PurchaseResponse.builder()
                .transactionId(transaction.getId())
                .message("Purchase completed successfully")
                .amount(transaction.getAmount())
                .build();
    }

    private MarketplaceItemResponse toResponse(MarketplaceItem item) {
        return MarketplaceItemResponse.builder()
                .id(item.getId())
                .itemName(item.getItemName())
                .itemType(item.getItemType())
                .price(item.getPrice())
                .description(item.getDescription())
                .build();
    }
}