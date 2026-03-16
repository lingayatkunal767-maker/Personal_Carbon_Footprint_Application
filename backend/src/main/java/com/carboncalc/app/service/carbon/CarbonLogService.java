package com.carboncalc.app.service.carbon;

import com.carboncalc.app.dto.carbon.CarbonCalculationResponse;
import com.carboncalc.app.dto.carbon.CarbonLogDetailResponse;
import com.carboncalc.app.dto.carbon.CarbonLogResponse;
import com.carboncalc.app.entity.CarbonLog;
import com.carboncalc.app.entity.User;
import com.carboncalc.app.repository.CarbonLogRepository;
import com.carboncalc.app.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CarbonLogService {

    private final CarbonLogRepository carbonLogRepository;
    private final UserService userService;

    public void createCarbonLog(User user, CarbonCalculationResponse calc) {
        CarbonLog log = CarbonLog.builder()
                .user(user)
                .date(LocalDate.now())
                .transportEmission(calc.getTransportEmission())
                .foodEmission(calc.getFoodEmission())
                .energyEmission(calc.getEnergyEmission())
                .totalEmission(calc.getTotalEmission())
                .build();

        carbonLogRepository.save(log);
    }

    public List<CarbonLogResponse> getLogs(Long userId) {
        User user = userService.getUserEntity(userId);

        return carbonLogRepository.findByUser(user)
                .stream()
                .map(log -> CarbonLogResponse.builder()
                        .id(log.getId())
                        .date(log.getDate())
                        .totalEmission(log.getTotalEmission())
                        .build())
                .toList();
    }

    public CarbonLogDetailResponse getLogDetail(Long logId) {
        CarbonLog log = carbonLogRepository.findById(logId)
                .orElseThrow(() -> new RuntimeException("Carbon log not found"));

        return CarbonLogDetailResponse.builder()
                .id(log.getId())
                .date(log.getDate())
                .transportEmission(log.getTransportEmission())
                .foodEmission(log.getFoodEmission())
                .energyEmission(log.getEnergyEmission())
                .totalEmission(log.getTotalEmission())
                .build();
    }
}