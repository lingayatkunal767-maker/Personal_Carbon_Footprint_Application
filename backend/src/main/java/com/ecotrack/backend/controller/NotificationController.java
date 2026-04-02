package com.ecotrack.backend.controller;

import com.ecotrack.backend.entity.Notification;
import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class NotificationController {

    private final NotificationRepository notifRepo;

    /** GET /api/notifications — current user's notifications, newest first */
    @GetMapping
    public ResponseEntity<List<Notification>> getAll(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(
            notifRepo.findByUserIdOrderByCreatedAtDesc(user.getId())
        );
    }

    /** GET /api/notifications/unread-count — sidebar bell badge count */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount(@AuthenticationPrincipal User user) {
        long count = notifRepo.countByUserIdAndReadFalse(user.getId());
        return ResponseEntity.ok(Map.of("count", count));
    }

    /** PATCH /api/notifications/{id}/read — mark one notification as read */
    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markRead(@AuthenticationPrincipal User user,
                                       @PathVariable Long id) {
        notifRepo.findById(id).ifPresent(n -> {
            if (n.getUser().getId().equals(user.getId())) {
                n.setRead(true);
                notifRepo.save(n);
            }
        });
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }

    /** PATCH /api/notifications/read-all — mark ALL as read */
    @PatchMapping("/read-all")
    public ResponseEntity<?> markAllRead(@AuthenticationPrincipal User user) {
        notifRepo.markAllReadByUserId(user.getId());
        return ResponseEntity.ok(Map.of("message", "All marked as read"));
    }

    /** DELETE /api/notifications/{id} — delete a notification (owner only) */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@AuthenticationPrincipal User user,
                                     @PathVariable Long id) {
        notifRepo.findById(id).ifPresent(n -> {
            if (n.getUser().getId().equals(user.getId()))
                notifRepo.delete(n);
        });
        return ResponseEntity.noContent().build();
    }
}
