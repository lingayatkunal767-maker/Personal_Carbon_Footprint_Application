package com.carbon.carbontracker.controller;

import com.carbon.carbontracker.model.User;
import com.carbon.carbontracker.repository.UserRepository;
import com.carbon.carbontracker.service.AdminAuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final AdminAuditLogService adminAuditLogService;

    // Basic list of users for admin tooling (e.g. badge assignment UI)
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/me")
    public User getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    @PutMapping("/{id}/block")
    public User blockUser(@PathVariable Long id, HttpServletRequest request) {
        User user = userRepository
                .findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.setActive(false);
        User saved = userRepository.save(user);
        adminAuditLogService.log(
                "User Blocked",
                (saved.getName() != null ? saved.getName() + " • " : "")
                        + (saved.getEmail() != null ? saved.getEmail() : "id " + id),
                request);
        return saved;
    }

    @PutMapping("/{id}/unblock")
    public User unblockUser(@PathVariable Long id, HttpServletRequest request) {
        User user = userRepository
                .findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.setActive(true);
        User saved = userRepository.save(user);
        adminAuditLogService.log(
                "User Unblocked",
                (saved.getName() != null ? saved.getName() + " • " : "")
                        + (saved.getEmail() != null ? saved.getEmail() : "id " + id),
                request);
        return saved;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long id) {
        // Soft delete: mark user inactive instead of removing DB row
        userRepository.findById(id).ifPresent(user -> {
            user.setActive(false);
            userRepository.save(user);
        });
    }
}