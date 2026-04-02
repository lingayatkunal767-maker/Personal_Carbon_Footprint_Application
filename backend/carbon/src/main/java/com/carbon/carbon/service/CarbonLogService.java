package com.carbon.carbon.service;

import com.carbon.carbon.entity.CarbonLog;
import com.carbon.carbon.entity.User;
import com.carbon.carbon.repository.CarbonLogRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CarbonLogService {

    private final CarbonLogRepository carbonLogRepository;
    private final BadgeAwardingService badgeAwardingService;
    private final LeaderboardScoreService leaderboardScoreService;

    public CarbonLogService(CarbonLogRepository carbonLogRepository,
                            BadgeAwardingService badgeAwardingService,
                            LeaderboardScoreService leaderboardScoreService) {
        this.carbonLogRepository = carbonLogRepository;
        this.badgeAwardingService = badgeAwardingService;
        this.leaderboardScoreService = leaderboardScoreService;
    }

    public void createOrUpdateDailyLog(User user,
                                       double transport,
                                       double food,
                                       double energy,
                                       double total) {

        LocalDate today = LocalDate.now();

        Optional<CarbonLog> existing =
                carbonLogRepository.findByUserAndDate(user, today);

        CarbonLog log = existing.orElse(new CarbonLog());

        log.setUser(user);
        log.setDate(today);
        log.setTransportEmission(transport);
        log.setFoodEmission(food);
        log.setEnergyEmission(energy);
        log.setTotalEmission(total);

        carbonLogRepository.save(log);

        // Check and award badges after logging emissions
        badgeAwardingService.checkAndAwardBadges(user.getId());

        // Update leaderboard score
        leaderboardScoreService.updateScoreBasedOnEmissions(user.getId(), BigDecimal.valueOf(total));
    }
}