package com.carboncalc.app.service.notification;

import com.carboncalc.app.entity.User;
import com.carboncalc.app.repository.CarbonLogRepository;
import com.carboncalc.app.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmissionAlertService {

    private final CarbonLogRepository carbonLogRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    public void checkAndNotify(Long userId, double threshold) {
        User user = userService.getUserEntity(userId);

        carbonLogRepository.findByUser(user).stream()
                .reduce((first, second) -> second)
                .ifPresent(log -> {
                    if (log.getTotalEmission() != null && log.getTotalEmission() > threshold) {
                        notificationService.createGeneralNotification(
                                user,
                                "Your latest carbon emission exceeded the threshold: " + log.getTotalEmission()
                        );
                    }
                });
    }
}