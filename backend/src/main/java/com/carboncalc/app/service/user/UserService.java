package com.carboncalc.app.service.user;

import com.carboncalc.app.dto.user.UpdateProfileRequest;
import com.carboncalc.app.dto.user.UserProfileResponse;
import com.carboncalc.app.dto.user.UserSummaryResponse;
import com.carboncalc.app.entity.User;
import com.carboncalc.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserProfileResponse getProfile(Long userId) {
        User user = getUserEntity(userId);

        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .ecoPoints(user.getEcoPoints())
                .build();
    }

    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = getUserEntity(userId);

        user.setName(request.getName());
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        return getProfile(userId);
    }

    public UserSummaryResponse getSummary(Long userId) {
        User user = getUserEntity(userId);

        return UserSummaryResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .ecoPoints(user.getEcoPoints())
                .build();
    }

    public User getUserEntity(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public void addEcoPoints(Long userId, int points) {
        User user = getUserEntity(userId);
        int current = user.getEcoPoints() == null ? 0 : user.getEcoPoints();
        user.setEcoPoints(current + points);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }
}