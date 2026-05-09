package com.sustainability.tracker.dto;

import com.sustainability.tracker.entity.Notification;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDTO {
    private Long id;
    private String notificationType;
    private String title;
    private String message;
    private Boolean isRead;
    private String priority;
    private String relatedEntityType;
    private Long relatedEntityId;
    private String actionUrl;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;

    public static NotificationResponseDTO from(Notification notification) {
        String notificationType = notification.getNotificationType();
        String normalizedTitle = normalizeTitle(notificationType, sanitizeText(notification.getTitle()));
        String normalizedMessage = normalizeMessageBody(sanitizeText(notification.getMessage()));

        return new NotificationResponseDTO(
                notification.getId(),
                notificationType,
                normalizedTitle,
                normalizedMessage,
                notification.getIsRead(),
                notification.getPriority(),
                notification.getRelatedEntityType(),
                notification.getRelatedEntityId(),
                notification.getActionUrl(),
                notification.getCreatedAt(),
                notification.getReadAt()
        );
    }

    private static String normalizeTitle(String notificationType, String title) {
        String safeTitle = title == null ? "" : title.trim();
        String lower = safeTitle.toLowerCase();
        if ("BADGE_EARNED".equalsIgnoreCase(notificationType)
                && (lower.contains("badge earned") || lower.contains("badge assigned"))) {
            return "Badge Earned";
        }
        if ("MARKETPLACE".equalsIgnoreCase(notificationType) && lower.contains("order cancelled")) {
            return "Order Cancelled";
        }
        if ("MARKETPLACE".equalsIgnoreCase(notificationType) && lower.contains("order confirmed")) {
            return "Order Confirmed";
        }
        return safeTitle.isBlank() ? "Notification" : safeTitle;
    }

    private static String sanitizeText(String value) {
        if (value == null) {
            return "";
        }

        String trimmed = value.trim();
        if (trimmed.isEmpty()) {
            return "";
        }

        String repaired = attemptLatin1ToUtf8Repair(trimmed);
        String selected = scoreTextQuality(repaired) > scoreTextQuality(trimmed) ? repaired : trimmed;

        return selected
                .replace("\u00a0", " ")
                .replace("â€™", "'")
                .replace("â€œ", "\"")
                .replace("â\u20ac\u009d", "\"")
                .replace("â\u20ac\u201c", "-")
                .trim();
    }

    private static String normalizeMessageBody(String message) {
        String safeMessage = message == null ? "" : message.trim();
        if (safeMessage.isBlank()) {
            return "Notification update.";
        }

        String normalized = safeMessage
                .replaceAll("\\s+", " ")
                .replaceAll("\\s+([,.;:!?])", "$1")
                .replaceAll("([^.!?])\\s+Reason:", "$1. Reason:")
            .replaceAll("([.!?])[.!?]+", "$1")
                .trim();

        normalized = capitalizeLeadingLetter(normalized);
        normalized = movePeriodBeforeTrailingEmoji(normalized);

        if (normalized.matches(".*\\p{So}$") && !normalized.matches(".*[.!?]\\s*\\p{So}$")) {
            normalized = normalized.replaceAll("(\\p{So})$", ". $1");
        }

        normalized = normalized
                .replaceAll("\\s+([,.;:!?])", "$1")
            .replaceAll("([.!?])[.!?]+", "$1")
                .replaceAll("([.!?])([\\p{So}])$", "$1 $2");

        if (!normalized.matches(".*[.!?]$") && !normalized.matches(".*\\p{So}$")) {
            normalized = normalized + ".";
        }

        return normalized;
    }

    private static String capitalizeLeadingLetter(String text) {
        if (text == null || text.isBlank()) {
            return "";
        }

        char[] chars = text.toCharArray();
        for (int i = 0; i < chars.length; i++) {
            if (Character.isLetter(chars[i])) {
                chars[i] = Character.toUpperCase(chars[i]);
                return new String(chars);
            }
        }

        return text;
    }

    private static String movePeriodBeforeTrailingEmoji(String text) {
        if (text == null || text.isBlank()) {
            return "";
        }

        return text.replaceAll("(\\p{So})\\.$", ". $1");
    }

    private static String attemptLatin1ToUtf8Repair(String source) {
        try {
            return new String(source.getBytes(StandardCharsets.ISO_8859_1), StandardCharsets.UTF_8);
        } catch (Exception ignored) {
            return source;
        }
    }

    private static int scoreTextQuality(String text) {
        if (text == null || text.isBlank()) {
            return Integer.MIN_VALUE;
        }

        int score = text.length();
        for (int i = 0; i < text.length(); i++) {
            char ch = text.charAt(i);
            if (ch == '\uFFFD') {
                score -= 8;
            }
            if (ch == 'Ã' || ch == 'Â' || ch == 'â') {
                score -= 4;
            }
        }
        return score;
    }
}
