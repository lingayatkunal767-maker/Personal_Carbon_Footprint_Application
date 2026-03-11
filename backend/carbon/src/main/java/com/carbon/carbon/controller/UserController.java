package com.carbon.carbon.controller;

import com.carbon.carbon.dto.UpdateProfileRequest;
import com.carbon.carbon.dto.UserProfileResponse;
import com.carbon.carbon.entity.User;
import com.carbon.carbon.exception.EmailConflictException;
import com.carbon.carbon.exception.ResourceNotFoundException;
import com.carbon.carbon.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
    }

    private static UserProfileResponse toProfile(User user) {
        return new UserProfileResponse(user.getId(), user.getName(), user.getEmail());
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> me() {
        return ResponseEntity.ok(toProfile(getCurrentUser()));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMe(@Valid @RequestBody UpdateProfileRequest request) {
        User user = getCurrentUser();

        if (request.getName() != null) {
            user.setName(request.getName());
        }

        if (request.getEmail() != null) {
            userRepository.findByEmail(request.getEmail()).ifPresent(existing -> {
                if (!existing.getId().equals(user.getId())) {
                    throw new EmailConflictException();
                }
            });
            user.setEmail(request.getEmail());
        }

        if (request.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        userRepository.save(user);
        return ResponseEntity.ok(toProfile(user));
    }
}

