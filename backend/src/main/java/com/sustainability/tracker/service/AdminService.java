package com.sustainability.tracker.service;

import com.sustainability.tracker.dto.*;
import com.sustainability.tracker.entity.*;
import com.sustainability.tracker.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminService {

    private final UserRepository userRepository;
    private final LifestyleSurveyRepository lifestyleSurveyRepository;
    private final CarbonLogRepository carbonLogRepository;
    private final BadgeDefinitionRepository badgeDefinitionRepository;
    private final UserBadgeAssignmentRepository userBadgeAssignmentRepository;
    private final BadgeRepository badgeRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<AdminUserDTO> getAllUsers() {
        return userRepository.findAll().stream().map(AdminUserDTO::from).toList();
    }

    public AdminUserDTO updateUserStatus(Long userId, boolean active) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        user.setIsActive(active);
        return AdminUserDTO.from(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public List<SurveyMonitorDTO> getSurveyMonitoringData(LocalDate from, LocalDate to) {
        List<LifestyleSurvey> surveys = loadSurveys(from, to);

        List<SurveyMonitorDTO> result = new ArrayList<>();
        for (LifestyleSurvey survey : surveys) {
            User user = userRepository.findById(survey.getUserId()).orElse(null);
            CarbonLog carbonLog = carbonLogRepository.findByUserIdAndLogDate(
                    survey.getUserId(), survey.getSurveyDate()
            ).orElse(null);

            String issue = detectIssue(survey, carbonLog);
            result.add(new SurveyMonitorDTO(
                    survey.getId(),
                    survey.getUserId(),
                    user != null ? user.getName() : "Unknown",
                    user != null ? user.getEmail() : "-",
                    survey.getSurveyDate(),
                    survey.getTransportMode() != null ? survey.getTransportMode().name() : "-",
                    safeDecimal(survey.getDistanceKmPerDay()),
                    safeInteger(survey.getMealsNonVegPerWeek()),
                    safeInteger(survey.getMealsVegPerWeek()),
                    safeDecimal(survey.getElectricityKwhPerMonth()),
                    safeDecimal(survey.getCookingGasCylindersPerMonth()),
                    carbonLog != null ? safeDecimal(carbonLog.getTotalEmission()) : BigDecimal.ZERO,
                    issue != null,
                    issue
            ));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<AdminCarbonLogDTO> getAllCarbonLogs(LocalDate from, LocalDate to) {
        List<CarbonLog> logs = loadCarbonLogs(from, to);
        List<AdminCarbonLogDTO> result = new ArrayList<>();

        for (CarbonLog log : logs) {
            User user = userRepository.findById(log.getUserId()).orElse(null);
            result.add(new AdminCarbonLogDTO(
                    log.getId(),
                    log.getUserId(),
                    user != null ? user.getName() : "Unknown",
                    user != null ? user.getEmail() : "-",
                    log.getLogDate(),
                    safeDecimal(log.getTransportEmission()),
                    safeDecimal(log.getFoodEmission()),
                    safeDecimal(log.getEnergyEmission()),
                    safeDecimal(log.getTotalEmission())
            ));
        }

        return result;
    }

    public AdminCarbonLogDTO updateCarbonLog(Long logId, CarbonLogUpdateRequest request) {
        CarbonLog log = carbonLogRepository.findById(logId)
                .orElseThrow(() -> new RuntimeException("Carbon log not found with id: " + logId));

        BigDecimal transport = safeEmission(request.getTransportEmission());
        BigDecimal food = safeEmission(request.getFoodEmission());
        BigDecimal energy = safeEmission(request.getEnergyEmission());
        BigDecimal total = transport.add(food).add(energy).setScale(2, RoundingMode.HALF_UP);

        log.setTransportEmission(transport);
        log.setFoodEmission(food);
        log.setEnergyEmission(energy);
        log.setTotalEmission(total);

        CarbonLog saved = carbonLogRepository.save(log);
        User user = userRepository.findById(saved.getUserId()).orElse(null);

        return new AdminCarbonLogDTO(
                saved.getId(),
                saved.getUserId(),
                user != null ? user.getName() : "Unknown",
                user != null ? user.getEmail() : "-",
                saved.getLogDate(),
                safeDecimal(saved.getTransportEmission()),
                safeDecimal(saved.getFoodEmission()),
                safeDecimal(saved.getEnergyEmission()),
                safeDecimal(saved.getTotalEmission())
        );
    }

    public void deleteCarbonLog(Long logId) {
        if (!carbonLogRepository.existsById(logId)) {
            throw new RuntimeException("Carbon log not found with id: " + logId);
        }
        carbonLogRepository.deleteById(logId);
    }

    @Transactional(readOnly = true)
    public AdminAnalyticsDTO getAnalytics(int months) {
        int safeMonths = Math.max(1, Math.min(months, 24));

        long totalUsers = userRepository.countByRole("USER");
        long activeUsers = userRepository.countByRoleAndIsActive("USER", true);

        long totalSurveys = lifestyleSurveyRepository.count();
        long totalCarbonLogs = carbonLogRepository.count();

        List<CarbonLog> allLogs = carbonLogRepository.findAll();

        BigDecimal totalPlatformEmission = allLogs.stream()
                .map(log -> safeDecimal(log.getTotalEmission()))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal transportTotal = allLogs.stream()
                .map(log -> safeDecimal(log.getTransportEmission()))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal foodTotal = allLogs.stream()
                .map(log -> safeDecimal(log.getFoodEmission()))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal energyTotal = allLogs.stream()
                .map(log -> safeDecimal(log.getEnergyEmission()))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        List<CategoryTotalDTO> breakdown = List.of(
                new CategoryTotalDTO("transport", transportTotal),
                new CategoryTotalDTO("food", foodTotal),
                new CategoryTotalDTO("energy", energyTotal)
        );

        LocalDate start = LocalDate.now().withDayOfMonth(1).minusMonths(safeMonths - 1L);
        List<MonthlyStatsDTO> monthlyTrend = buildMonthlyTrend(start, safeMonths, allLogs);

        return new AdminAnalyticsDTO(
                totalUsers,
                activeUsers,
                totalSurveys,
                totalCarbonLogs,
                totalPlatformEmission,
                breakdown,
                monthlyTrend
        );
    }

    @Transactional(readOnly = true)
    public List<BadgeDefinitionDTO> getBadgeDefinitions() {
        return badgeDefinitionRepository.findAllByOrderByBadgeNameAsc().stream()
                .map(BadgeDefinitionDTO::from)
                .toList();
    }

    public BadgeDefinitionDTO upsertBadgeDefinition(BadgeDefinitionDTO request) {
        BadgeDefinition definition;

        if (request.getId() != null) {
            definition = badgeDefinitionRepository.findById(request.getId())
                    .orElseThrow(() -> new RuntimeException("Badge definition not found with id: " + request.getId()));
        } else {
            definition = badgeDefinitionRepository.findByBadgeNameIgnoreCase(request.getBadgeName())
                    .orElseGet(BadgeDefinition::new);
        }

        definition.setBadgeName(request.getBadgeName().trim());
        definition.setBadgeType(request.getBadgeType().trim().toUpperCase(Locale.ROOT));
        definition.setDescription(request.getDescription());
        definition.setThresholdPercent(request.getThresholdPercent());
        definition.setIsActive(Boolean.TRUE.equals(request.getActive()));

        return BadgeDefinitionDTO.from(badgeDefinitionRepository.save(definition));
    }

    public boolean assignBadgeToUser(BadgeAssignmentRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getUserId()));

        BadgeDefinition definition = badgeDefinitionRepository.findById(request.getBadgeDefinitionId())
                .orElseThrow(() -> new RuntimeException("Badge definition not found with id: " + request.getBadgeDefinitionId()));

        if (userBadgeAssignmentRepository.existsByUserIdAndBadgeDefinitionId(user.getId(), definition.getId())) {
            return false;
        }

        UserBadgeAssignment assignment = new UserBadgeAssignment();
        assignment.setUser(user);
        assignment.setBadgeDefinition(definition);
        assignment.setAssignedReason(request.getReason());
        UserBadgeAssignment savedAssignment = userBadgeAssignmentRepository.save(assignment);

        if (!badgeRepository.existsByUserIdAndBadgeName(user.getId(), definition.getBadgeName())) {
            Badge badge = new Badge();
            badge.setUser(user);
            badge.setBadgeName(definition.getBadgeName());
            badge.setBadgeType(definition.getBadgeType());
            badge.setDescription(definition.getDescription());
            badgeRepository.save(badge);
        }

        notificationService.notifyBadgeAssignedByAdmin(
                user.getId(),
                definition.getBadgeName(),
                definition.getDescription(),
                request.getReason(),
                savedAssignment.getId()
        );

        return true;
    }

    public int assignBadgesByPerformance(int minReductionPercent) {
        List<BadgeDefinition> activeBadges = badgeDefinitionRepository.findByIsActiveTrueOrderByBadgeNameAsc();
        if (activeBadges.isEmpty()) {
            return 0;
        }

        List<User> users = userRepository.findByRoleOrderByCreatedAtDesc("USER");
        int assignedCount = 0;

        for (User user : users) {
            BigDecimal reduction = calculateUserReductionPercent(user.getId());
            for (BadgeDefinition definition : activeBadges) {
                BigDecimal threshold = definition.getThresholdPercent();
                if (threshold == null) {
                    continue;
                }

                if (reduction.compareTo(threshold) >= 0 && reduction.compareTo(BigDecimal.valueOf(minReductionPercent)) >= 0) {
                    boolean exists = userBadgeAssignmentRepository.existsByUserIdAndBadgeDefinitionId(user.getId(), definition.getId());
                    if (!exists) {
                        BadgeAssignmentRequest request = new BadgeAssignmentRequest();
                        request.setUserId(user.getId());
                        request.setBadgeDefinitionId(definition.getId());
                        request.setReason("Assigned by performance automation at " + reduction + "% reduction");
                        if (assignBadgeToUser(request)) {
                            assignedCount++;
                        }
                    }
                }
            }
        }

        return assignedCount;
    }

    @Transactional(readOnly = true)
    public String exportCarbonLogsCsv(LocalDate from, LocalDate to) {
        List<AdminCarbonLogDTO> logs = getAllCarbonLogs(from, to);
        StringBuilder builder = new StringBuilder();
        builder.append("id,userId,userName,userEmail,logDate,transportEmission,foodEmission,energyEmission,totalEmission\n");

        for (AdminCarbonLogDTO log : logs) {
            builder.append(log.getId()).append(',')
                    .append(log.getUserId()).append(',')
                    .append(escapeCsv(log.getUserName())).append(',')
                    .append(escapeCsv(log.getUserEmail())).append(',')
                    .append(log.getLogDate()).append(',')
                    .append(log.getTransportEmission()).append(',')
                    .append(log.getFoodEmission()).append(',')
                    .append(log.getEnergyEmission()).append(',')
                    .append(log.getTotalEmission())
                    .append('\n');
        }

        return builder.toString();
    }

    private List<LifestyleSurvey> loadSurveys(LocalDate from, LocalDate to) {
        if (from == null && to == null) {
            return lifestyleSurveyRepository.findAllByOrderBySurveyDateDesc();
        }
        LocalDate safeFrom = from != null ? from : LocalDate.MIN;
        LocalDate safeTo = to != null ? to : LocalDate.MAX;
        return lifestyleSurveyRepository.findBySurveyDateBetweenOrderBySurveyDateDesc(safeFrom, safeTo);
    }

    private List<CarbonLog> loadCarbonLogs(LocalDate from, LocalDate to) {
        if (from == null && to == null) {
            return carbonLogRepository.findAllByOrderByLogDateDesc();
        }
        LocalDate safeFrom = from != null ? from : LocalDate.MIN;
        LocalDate safeTo = to != null ? to : LocalDate.MAX;
        return carbonLogRepository.findByLogDateBetweenOrderByLogDateDesc(safeFrom, safeTo);
    }

    private String detectIssue(LifestyleSurvey survey, CarbonLog log) {
        if (survey.getDistanceKmPerDay() != null && survey.getDistanceKmPerDay().compareTo(new BigDecimal("250")) > 0) {
            return "Daily transport distance is unrealistically high";
        }
        if (survey.getElectricityKwhPerMonth() != null && survey.getElectricityKwhPerMonth().compareTo(new BigDecimal("2000")) > 0) {
            return "Monthly electricity usage is unrealistically high";
        }
        if (survey.getMealsNonVegPerWeek() != null && survey.getMealsNonVegPerWeek() > 21) {
            return "Non-veg meal count exceeds realistic weekly limit";
        }
        if (survey.getMealsVegPerWeek() != null && survey.getMealsVegPerWeek() > 21) {
            return "Veg meal count exceeds realistic weekly limit";
        }
        if (log != null && log.getTotalEmission() != null && log.getTotalEmission().compareTo(new BigDecimal("100")) > 0) {
            return "Calculated daily total emission looks unrealistic";
        }
        return null;
    }

    private BigDecimal calculateUserReductionPercent(Long userId) {
        List<CarbonLog> logs = carbonLogRepository.findByUserIdOrderByLogDate(userId);
        if (logs.size() < 2) {
            return BigDecimal.ZERO;
        }

        BigDecimal first = safeDecimal(logs.get(0).getTotalEmission());
        BigDecimal latest = safeDecimal(logs.get(logs.size() - 1).getTotalEmission());

        if (first.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        return first.subtract(latest)
                .divide(first, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .max(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private List<MonthlyStatsDTO> buildMonthlyTrend(LocalDate start, int months, List<CarbonLog> logs) {
        List<MonthlyStatsDTO> trend = new ArrayList<>();

        for (int i = 0; i < months; i++) {
            LocalDate monthStart = start.plusMonths(i);
            String key = String.format("%04d-%02d", monthStart.getYear(), monthStart.getMonthValue());
            BigDecimal total = logs.stream()
                    .filter(log -> log.getLogDate() != null)
                    .filter(log -> log.getLogDate().getYear() == monthStart.getYear())
                    .filter(log -> log.getLogDate().getMonthValue() == monthStart.getMonthValue())
                    .map(log -> safeDecimal(log.getTotalEmission()))
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .setScale(2, RoundingMode.HALF_UP);
            trend.add(new MonthlyStatsDTO(key, total));
        }

        return trend;
    }

    private BigDecimal safeEmission(BigDecimal value) {
        if (value == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        if (value.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Emission values cannot be negative");
        }
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal safeDecimal(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private Integer safeInteger(Integer value) {
        return value == null ? 0 : value;
    }

    private String escapeCsv(String value) {
        if (value == null) {
            return "";
        }
        String escaped = value.replace("\"", "\"\"");
        return "\"" + escaped + "\"";
    }
}
