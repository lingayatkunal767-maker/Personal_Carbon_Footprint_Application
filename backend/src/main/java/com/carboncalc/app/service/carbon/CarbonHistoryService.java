package com.carboncalc.app.service.carbon;

import com.carboncalc.app.dto.carbon.CarbonLogResponse;
import com.carboncalc.app.dto.carbon.CarbonTrendResponse;
import com.carboncalc.app.entity.User;
import com.carboncalc.app.repository.CarbonLogRepository;
import com.carboncalc.app.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CarbonHistoryService {

    private final CarbonLogRepository carbonLogRepository;
    private final UserService userService;

    public List<CarbonLogResponse> getHistory(Long userId, LocalDate from, LocalDate to) {
        User user = userService.getUserEntity(userId);

        return carbonLogRepository.findByUserAndDateBetween(user, from, to)
                .stream()
                .map(log -> CarbonLogResponse.builder()
                        .id(log.getId())
                        .date(log.getDate())
                        .totalEmission(log.getTotalEmission())
                        .build())
                .toList();
    }

    public List<CarbonTrendResponse> getTrend(Long userId, LocalDate from, LocalDate to) {
        User user = userService.getUserEntity(userId);

        return carbonLogRepository.findByUserAndDateBetween(user, from, to)
                .stream()
                .map(log -> CarbonTrendResponse.builder()
                        .label(log.getDate().toString())
                        .totalEmission(log.getTotalEmission())
                        .build())
                .toList();
    }
}