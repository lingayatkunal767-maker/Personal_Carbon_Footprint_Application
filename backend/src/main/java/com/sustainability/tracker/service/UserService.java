package com.sustainability.tracker.service;

import com.sustainability.tracker.dto.UserProfileRequest;
import com.sustainability.tracker.entity.User;
import com.sustainability.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        Long safeId = Objects.requireNonNull(id, "id is required");
        User user = userRepository.findById(safeId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("USER");
        }
        if (user.getIsActive() == null) {
            user.setIsActive(true);
        }
        return user;
    }

    public User getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("USER");
        }
        if (user.getIsActive() == null) {
            user.setIsActive(true);
        }
        return user;
    }

    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("User already exists with email: " + user.getEmail());
        }
        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("USER");
        }
        if (user.getIsActive() == null) {
            user.setIsActive(true);
        }
        return userRepository.save(user);
    }

    public User updateUser(Long id, User updatedUser) {
        User existing = getUserById(id);
        existing.setName(updatedUser.getName());
        existing.setProfilePicture(updatedUser.getProfilePicture());
        return userRepository.save(existing);
    }

    @SuppressWarnings("null")
    public User updateProfile(Long id, UserProfileRequest req) {
        User existing = getUserById(id);
        if (req.getName() != null && !req.getName().isBlank()) {
            existing.setName(req.getName().trim());
        }
        if (req.getProfilePicture() != null) {
            existing.setProfilePicture(req.getProfilePicture());
        }
        return userRepository.save(existing);
    }

    public void deleteUser(Long id) {
        Long safeId = Objects.requireNonNull(id, "id is required");
        getUserById(safeId);
        userRepository.deleteById(safeId);
    }
}
