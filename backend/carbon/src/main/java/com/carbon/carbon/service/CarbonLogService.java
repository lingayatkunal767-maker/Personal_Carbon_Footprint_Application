package com.carbon.carbon.service;

import com.carbon.carbon.entity.CarbonLog;
import com.carbon.carbon.entity.User;
import com.carbon.carbon.repository.CarbonLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class CarbonLogService {

    private final CarbonLogRepository carbonLogRepository;

    public CarbonLogService(CarbonLogRepository carbonLogRepository) {
        this.carbonLogRepository = carbonLogRepository;
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
    }
}