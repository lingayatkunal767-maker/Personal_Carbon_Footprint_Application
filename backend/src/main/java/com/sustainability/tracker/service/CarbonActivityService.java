package com.sustainability.tracker.service;

import com.sustainability.tracker.dto.ActivityRequest;
import com.sustainability.tracker.dto.ActivityResponse;
import com.sustainability.tracker.entity.CarbonActivity;
import com.sustainability.tracker.entity.User;
import com.sustainability.tracker.repository.CarbonActivityRepository;
import com.sustainability.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CarbonActivityService {

    private final CarbonActivityRepository activityRepository;
    private final UserRepository userRepository;

    public List<ActivityResponse> getActivitiesByUser(Long userId) {
        return activityRepository.findByUserIdOrderByActivityDateDesc(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ActivityResponse> getActivitiesByDateRange(Long userId,
                                                           LocalDate start,
                                                           LocalDate end) {
        return activityRepository
                .findByUserIdAndActivityDateBetweenOrderByActivityDateDesc(userId, start, end)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ActivityResponse createActivity(ActivityRequest request) {
        Long safeUserId = Objects.requireNonNull(request.getUserId(), "request.userId is required");
        User user = userRepository.findById(safeUserId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getUserId()));

        CarbonActivity activity = new CarbonActivity();
        activity.setUser(user);
        activity.setActivityType(request.getActivityType() != null ? request.getActivityType() : "other");
        activity.setActivityName(request.getActivityName());
        activity.setCarbonAmount(request.getCarbonAmount());
        activity.setActivityDate(request.getActivityDate() != null ? request.getActivityDate() : LocalDate.now());
        activity.setDescription(request.getDescription());

        return toResponse(activityRepository.save(activity));
    }

    public void deleteActivity(Long id) {
        Long safeId = Objects.requireNonNull(id, "id is required");
        if (!activityRepository.existsById(safeId)) {
            throw new RuntimeException("Activity not found with id: " + id);
        }
        activityRepository.deleteById(safeId);
    }

    private ActivityResponse toResponse(CarbonActivity a) {
        return new ActivityResponse(
                a.getId(),
                a.getUser().getId(),
                a.getActivityType(),
                a.getActivityName(),
                a.getCarbonAmount(),
                a.getActivityDate(),
                a.getDescription(),
                a.getCreatedAt()
        );
    }
}
