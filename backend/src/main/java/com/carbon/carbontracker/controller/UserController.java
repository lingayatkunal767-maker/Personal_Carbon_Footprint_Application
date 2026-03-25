package com.carbon.carbontracker.controller;

import com.carbon.carbontracker.model.User;
import com.carbon.carbontracker.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

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
    public User blockUser(@PathVariable Long id) {
        User user = userRepository
                .findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.setActive(false);
        return userRepository.save(user);
    }

    @PutMapping("/{id}/unblock")
    public User unblockUser(@PathVariable Long id) {
        User user = userRepository
                .findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.setActive(true);
        return userRepository.save(user);
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