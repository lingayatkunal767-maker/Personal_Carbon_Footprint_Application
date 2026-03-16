package com.carboncalc.app.service.carbon;

import com.carboncalc.app.dto.carbon.CategoryBreakdownResponse;
import com.carboncalc.app.dto.carbon.DashboardSummaryResponse;
import com.carboncalc.app.entity.CarbonLog;
import com.carboncalc.app.entity.User;
import com.carboncalc.app.repository.CarbonLogRepository;
import com.carboncalc.app.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final CarbonLogRepository carbonLogRepository;
    private final UserService userService;

    public DashboardSummaryResponse getSummary(Long userId) {
        User user = userService.getUserEntity(userId);
        List<CarbonLog> logs = carbonLogRepository.findByUser(user);

        double latest = logs.stream()
                .max(Comparator.comparing(CarbonLog::getDate))
                .map(CarbonLog::getTotalEmission)
                .orElse(0.0);

        double average = logs.stream()
                .mapToDouble(log -> log.getTotalEmission() == null ? 0.0 : log.getTotalEmission())
                .average()
                .orElse(0.0);

        return DashboardSummaryResponse.builder()
                .latestEmission(round(latest))
                .averageEmission(round(average))
                .ecoPoints(user.getEcoPoints() == null ? 0 : user.getEcoPoints())
                .totalLogs((long) logs.size())
                .build();
    }

    public CategoryBreakdownResponse getCategoryBreakdown(Long userId) {
        User user = userService.getUserEntity(userId);
        List<CarbonLog> logs = carbonLogRepository.findByUser(user);

        double transport = logs.stream().mapToDouble(l -> l.getTransportEmission() == null ? 0.0 : l.getTransportEmission()).sum();
        double food = logs.stream().mapToDouble(l -> l.getFoodEmission() == null ? 0.0 : l.getFoodEmission()).sum();
        double energy = logs.stream().mapToDouble(l -> l.getEnergyEmission() == null ? 0.0 : l.getEnergyEmission()).sum();

        return CategoryBreakdownResponse.builder()
                .transportEmission(round(transport))
                .foodEmission(round(food))
                .energyEmission(round(energy))
                .build();
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}