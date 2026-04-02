package com.carboncalc.backend.service;

import com.carboncalc.backend.dto.AdminUserResponse;
import com.carboncalc.backend.entity.User;
import com.carboncalc.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final SurveyRepository surveyRepository;
    private final GoalRepository goalRepository;
    private final BadgeRepository badgeRepository;
    private final NotificationService notificationService;

    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll().stream()
            .filter(u -> !"ADMIN".equals(u.getRole()))
            .map(this::toDto)
            .toList();
    }

    public AdminUserResponse getUserAnalytics(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return toDto(user);
    }

    @Transactional
    public AdminUserResponse setUserActive(Long userId, boolean active) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        if ("ADMIN".equals(user.getRole())) throw new RuntimeException("Cannot modify admin account");
        user.setIsActive(active);
        return toDto(userRepository.save(user));
    }

    public Map<String, Object> getPlatformStats() {
        long totalUsers    = userRepository.findAll().stream().filter(u -> !"ADMIN".equals(u.getRole())).count();
        long activeUsers   = userRepository.findAll().stream().filter(u -> !"ADMIN".equals(u.getRole()) && !Boolean.FALSE.equals(u.getIsActive())).count();
        long totalSurveys  = surveyRepository.count();
        long totalGoals    = goalRepository.count();
        long achievedGoals = goalRepository.findAll().stream().filter(g -> "ACHIEVED".equals(g.getStatus())).count();
        long totalBadges   = badgeRepository.count();
        double totalEmissions = surveyRepository.findAll().stream()
            .mapToDouble(s -> s.getCarbonScore() != null ? s.getCarbonScore() : 0).sum();

        return Map.of(
            "totalUsers",     totalUsers,
            "activeUsers",    activeUsers,
            "inactiveUsers",  totalUsers - activeUsers,
            "totalSurveys",   totalSurveys,
            "totalGoals",     totalGoals,
            "achievedGoals",  achievedGoals,
            "totalBadges",    totalBadges,
            "totalEmissions", Math.round(totalEmissions * 100.0) / 100.0
        );
    }

    public void sendNotification(String targetUserId, String title, String message, String type) {
        if ("all".equalsIgnoreCase(targetUserId) || targetUserId == null) {
            userRepository.findAll().stream()
                .filter(u -> !"ADMIN".equals(u.getRole()))
                .forEach(u -> notificationService.push(u.getId(), title, message, type));
        } else {
            notificationService.push(Long.parseLong(targetUserId), title, message, type);
        }
    }

    private AdminUserResponse toDto(User u) {
        long surveys  = surveyRepository.countByUserId(u.getId());
        long goals    = goalRepository.countByUserIdAndStatus(u.getId(), "ACHIEVED");
        long badges   = badgeRepository.countByUserId(u.getId());
        double total  = surveyRepository.findByUserIdOrderByDateDesc(u.getId()).stream()
            .mapToDouble(s -> s.getCarbonScore() != null ? s.getCarbonScore() : 0).sum();

        return AdminUserResponse.builder()
            .id(u.getId()).name(u.getName()).email(u.getEmail())
            .role(u.getRole()).isActive(!Boolean.FALSE.equals(u.getIsActive()))
            .surveyCount(surveys).goalsCompleted(goals)
            .badgesEarned(badges).totalEmission(Math.round(total * 100.0) / 100.0)
            .build();
    }

    @Transactional
    public List<Map<String, Object>> getAllSurveysAdmin() {
        return surveyRepository.findAll().stream().map(s -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", s.getId());
            m.put("userId", s.getUser() != null ? s.getUser().getId() : null);
            m.put("userName", s.getUser() != null ? s.getUser().getName() : "—");
            m.put("userEmail", s.getUser() != null ? s.getUser().getEmail() : "—");
            m.put("transport", s.getTransport());
            m.put("food", s.getFood());
            m.put("energy", s.getEnergy());
            m.put("transportEmission", s.getTransportEmission());
            m.put("foodEmission", s.getFoodEmission());
            m.put("energyEmission", s.getEnergyEmission());
            m.put("carbonScore", s.getCarbonScore());
            m.put("date", s.getDate());
            return m;
        }).toList();
    }

    @Transactional
    public List<Map<String, Object>> getAllGoalsAdmin() {
        return goalRepository.findAll().stream().map(g -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", g.getId());
            m.put("userId", g.getUser() != null ? g.getUser().getId() : null);
            m.put("userName", g.getUser() != null ? g.getUser().getName() : "—");
            m.put("goalTitle", g.getGoalTitle());
            m.put("targetEmission", g.getTargetEmission());
            m.put("currentEmission", g.getCurrentEmission());
            m.put("status", g.getStatus());
            m.put("category", g.getCategory());
            m.put("timeframe", g.getTimeframe());
            m.put("createdAt", g.getCreatedAt());
            return m;
        }).toList();
    }
}
