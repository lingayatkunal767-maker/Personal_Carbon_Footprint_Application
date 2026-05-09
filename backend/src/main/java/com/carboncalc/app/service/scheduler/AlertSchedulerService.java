package com.carboncalc.app.service.scheduler;

import com.carboncalc.app.repository.UserRepository;
import com.carboncalc.app.service.notification.EmissionAlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AlertSchedulerService {

    private final UserRepository userRepository;
    private final EmissionAlertService emissionAlertService;

    @Scheduled(cron = "0 0 9 * * *")
    public void runDailyAlerts() {
        userRepository.findAll().forEach(user ->
                emissionAlertService.checkAndNotify(user.getId(), 10.0)
        );
    }
}