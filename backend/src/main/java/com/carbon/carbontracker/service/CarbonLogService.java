package com.carbon.carbontracker.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.util.Optional;
import java.math.BigDecimal;
import com.carbon.carbontracker.repository.CarbonLogRepository;
import com.carbon.carbontracker.model.*;
@Service
public class CarbonLogService {

    @Autowired
    private CarbonLogRepository carbonLogRepository;

    public void createOrUpdateLog(
        User user,
        double transport,
        double food,
        double energy,
        double total
) {

    LocalDate today = LocalDate.now();

    Optional<CarbonLog> existing =
            carbonLogRepository.findByUserAndDate(user, today);

    BigDecimal transportBD = BigDecimal.valueOf(transport);
    BigDecimal foodBD = BigDecimal.valueOf(food);
    BigDecimal energyBD = BigDecimal.valueOf(energy);
    BigDecimal totalBD = BigDecimal.valueOf(total);

    if (existing.isPresent()) {

        CarbonLog log = existing.get();
        log.setTransportEmission(transportBD);
        log.setFoodEmission(foodBD);
        log.setEnergyEmission(energyBD);
        log.setTotalEmission(totalBD);

        carbonLogRepository.save(log);

    } else {

        CarbonLog log = CarbonLog.builder()
                .user(user)
                .date(today)
                .transportEmission(transportBD)
                .foodEmission(foodBD)
                .energyEmission(energyBD)
                .totalEmission(totalBD)
                .build();

        carbonLogRepository.save(log);
    }
}
}