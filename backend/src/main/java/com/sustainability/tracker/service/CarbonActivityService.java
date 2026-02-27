package com.sustainability.tracker.service;

import com.sustainability.tracker.entity.CarbonActivity;
import com.sustainability.tracker.entity.User;
import com.sustainability.tracker.repository.CarbonActivityRepository;
import com.sustainability.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CarbonActivityService {

    private final CarbonActivityRepository activityRepository;
    private final UserRepository userRepository;

    public List<CarbonActivity> getActivitiesByUser(Long userId) {
        return activityRepository.findByUserIdOrderByActivityDateDesc(userId);
    }

    public List<CarbonActivity> getActivitiesByDateRange(Long userId,
                                                          LocalDate start,
                                                          LocalDate end) {
        return activityRepository
                .findByUserIdAndActivityDateBetweenOrderByActivityDateDesc(userId, start, end);
    }

    public CarbonActivity createActivity(CarbonActivity activity) {
        // Ensure the referenced user exists
        Long userId = activity.getUser().getId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        activity.setUser(user);
        return activityRepository.save(activity);
    }

    public void deleteActivity(Long id) {
        if (!activityRepository.existsById(id)) {
            throw new RuntimeException("Activity not found with id: " + id);
        }
        activityRepository.deleteById(id);
    }
}
