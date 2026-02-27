package com.sustainability.tracker.service;

import com.sustainability.tracker.dto.AuthRequest;
import com.sustainability.tracker.dto.AuthResponse;
import com.sustainability.tracker.dto.GoogleAuthRequest;
import com.sustainability.tracker.entity.User;
import com.sustainability.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // ─── REGISTER ──────────────────────────────────────────────────────
    @Transactional
    public AuthResponse register(AuthRequest request) {
        // Validate fields
        if (request.getName() == null || request.getName().isBlank()) {
            return new AuthResponse(false, "Name is required", null, null, null, null);
        }
        if (request.getEmail() == null || !request.getEmail().contains("@")) {
            return new AuthResponse(false, "Valid email is required", null, null, null, null);
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            return new AuthResponse(false, "Password must be at least 6 characters", null, null, null, null);
        }

        // Check duplicate email
        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            return new AuthResponse(false, "An account with this email already exists. Please login instead.", null, null, null, null);
        }

        // Hash password and save
        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        User saved = userRepository.save(user);

        return new AuthResponse(true, "Account created successfully! Welcome, " + saved.getName() + "!",
                saved.getId(), saved.getName(), saved.getEmail(), saved.getProfilePicture());
    }

    // ─── LOGIN ─────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            return new AuthResponse(false, "Email and password are required", null, null, null, null);
        }

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElse(null);

        if (user == null) {
            return new AuthResponse(false, "No account found with this email. Please sign up first.", null, null, null, null);
        }

        // User registered via Google (no password set)
        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            return new AuthResponse(false, "This account uses Google sign-in. Please login with Google.", null, null, null, null);
        }

        // Validate password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return new AuthResponse(false, "Incorrect password. Please try again.", null, null, null, null);
        }

        return new AuthResponse(true, "Welcome back, " + user.getName() + "!",
                user.getId(), user.getName(), user.getEmail(), user.getProfilePicture());
    }

    // ─── GOOGLE LOGIN / REGISTER (upsert) ──────────────────────────────
    @Transactional
    public AuthResponse loginWithGoogle(GoogleAuthRequest request) {
        if (request.getEmail() == null || !request.getEmail().contains("@")) {
            return new AuthResponse(false, "Valid email is required", null, null, null, null);
        }

        String email = request.getEmail().toLowerCase().trim();
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            // New Google user — create account
            user = new User();
            user.setName(request.getName() != null ? request.getName().trim() : "User");
            user.setEmail(email);
            user.setOauthProvider("google");
            user.setOauthId(request.getGoogleId());
            user.setProfilePicture(request.getProfilePicture());
            user = userRepository.save(user);
            return new AuthResponse(true, "Welcome, " + user.getName() + "! Account created.",
                    user.getId(), user.getName(), user.getEmail(), user.getProfilePicture());
        }

        // Existing user — update Google fields if not already set
        boolean changed = false;
        if (user.getOauthProvider() == null || user.getOauthProvider().isBlank()) {
            user.setOauthProvider("google");
            changed = true;
        }
        if (user.getOauthId() == null && request.getGoogleId() != null) {
            user.setOauthId(request.getGoogleId());
            changed = true;
        }
        if (request.getProfilePicture() != null && !request.getProfilePicture().equals(user.getProfilePicture())) {
            user.setProfilePicture(request.getProfilePicture());
            changed = true;
        }
        if (changed) {
            user = userRepository.save(user);
        }

        return new AuthResponse(true, "Welcome back, " + user.getName() + "!",
                user.getId(), user.getName(), user.getEmail(), user.getProfilePicture());
    }
}
