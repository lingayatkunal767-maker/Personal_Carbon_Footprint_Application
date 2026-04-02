package com.ecotrack.backend.service;

import com.ecotrack.backend.model.SystemLog;
import com.ecotrack.backend.repository.SystemLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LogService {

    @Autowired
    private SystemLogRepository logRepository;

    public void log(String email, String role, String action, String details) {
        SystemLog log = new SystemLog(email, role, action, details);
        logRepository.save(log);
    }
}