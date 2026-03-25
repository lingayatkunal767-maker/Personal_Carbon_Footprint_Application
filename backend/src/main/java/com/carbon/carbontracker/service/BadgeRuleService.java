package com.carbon.carbontracker.service;

import com.carbon.carbontracker.dto.BadgeRequest;
import com.carbon.carbontracker.model.BadgeTemplate;
import com.carbon.carbontracker.model.Goal;
import com.carbon.carbontracker.model.User;
import com.carbon.carbontracker.repository.BadgeTemplateRepository;
import com.carbon.carbontracker.repository.CarbonLogRepository;
import com.carbon.carbontracker.repository.GoalRepository;
import com.carbon.carbontracker.repository.SurveyRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BadgeRuleService {

    private final BadgeTemplateRepository badgeTemplateRepository;
    private final BadgeService badgeService;
    private final CarbonLogRepository carbonLogRepository;
    private final GoalRepository goalRepository;
    private final SurveyRepository surveyRepository;

    public BadgeRuleService(
            BadgeTemplateRepository badgeTemplateRepository,
            BadgeService badgeService,
            CarbonLogRepository carbonLogRepository,
            GoalRepository goalRepository,
            SurveyRepository surveyRepository
    ) {
        this.badgeTemplateRepository = badgeTemplateRepository;
        this.badgeService = badgeService;
        this.carbonLogRepository = carbonLogRepository;
        this.goalRepository = goalRepository;
        this.surveyRepository = surveyRepository;
    }

    private Optional<BadgeTemplate> byCode(String code) {
        return badgeTemplateRepository.findByCode(code);
    }

    private void safeAward(Long userId, String code) {
        byCode(code).ifPresent(tpl -> {
            BadgeRequest req = new BadgeRequest();
            req.setBadgeName(tpl.getName());
            req.setDescription(tpl.getDescription());
            try {
                badgeService.awardBadge(userId, req);
            } catch (RuntimeException ignored) {
                // ignore duplicate or other non-critical errors for auto rules
            }
        });
    }

    // ───────────────────────────────── FIRST LOG + CONSISTENCY ─────────────────────────────────
    public void afterCarbonLogSaved(User user) {
        Long userId = user.getId();

        List<com.carbon.carbontracker.model.CarbonLog> logsForUser =
                carbonLogRepository.findByUser(user);

        int totalLogs = logsForUser.size();

        // FIRST_LOG
        if (totalLogs == 1) {
            safeAward(userId, "FIRST_LOG");
        }

        // CONSISTENCY_KING – 100+ logs
        if (totalLogs >= 100) {
            safeAward(userId, "CONSISTENCY_KING");
        }

        // LOW_EMITTER, ECO_STREAK, WEEK_WARRIOR, WEEKLY_CHECKIN, SOLAR_HERO,
        // PLANT_BASED_HERO, ENERGY_SAVER, NIGHT_LOGGER, PUBLIC_TRANSPORT_PRO
        // would be implemented here by analysing logs by date and category.
        // These are left as future enhancements to avoid heavy logic now.
    }

    // ───────────────────────────────── GOAL BASED ─────────────────────────────────
    public void afterGoalCreated(Long userId) {
        long totalGoals = goalRepository.findByUser_Id(userId).size();
        if (totalGoals == 1L) {
            safeAward(userId, "GOAL_SETTER");
        }
    }

    public void afterGoalStatusUpdated(Long userId, Goal.GoalStatus newStatus) {
        if (newStatus == Goal.GoalStatus.COMPLETED) {
            long completed = goalRepository.countByUser_IdAndStatus(userId, Goal.GoalStatus.COMPLETED);
            if (completed >= 1L) {
                safeAward(userId, "GOAL_ACHIEVER");
            }
        }
    }

    // ───────────────────────────────── SURVEY BASED ─────────────────────────────────
    public void afterSurveySubmitted(Long userId) {
        // first survey
        long count = surveyRepository.findAll().stream()
                .filter(s -> s.getUser() != null && userId.equals(s.getUser().getId()))
                .count();

        if (count == 1L) {
            safeAward(userId, "ECO_STARTER");
        }

        // Survey Master – at least one survey
        if (count >= 1L) {
            safeAward(userId, "SURVEY_MASTER");
        }
    }

    // ───────────────────────────────── LEADERBOARD BASED ─────────────────────────────────
    public void onLeaderboardPosition(Long userId, int rank, int totalUsers) {
        if (totalUsers <= 0) return;
        int cutoff = (int) Math.ceil(totalUsers * 0.10);
        if (rank > 0 && rank <= cutoff) {
            safeAward(userId, "GREEN_CHAMPION");
        }
    }

    // ───────────────────────────────── CARBON CUTTER (STUB) ─────────────────────────────────
    public void checkCarbonCutter(Long userId, LocalDate today) {
        // Stub for future: compare two 30‑day windows of emissions.
        // This is left as a placeholder so the rule location is clear.
    }
}

