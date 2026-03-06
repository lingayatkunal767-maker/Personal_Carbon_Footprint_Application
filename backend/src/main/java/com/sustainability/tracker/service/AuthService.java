package com.sustainability.tracker.service;

import com.sustainability.tracker.dto.AuthRequest;
import com.sustainability.tracker.dto.AuthResponse;
import com.sustainability.tracker.dto.GoogleAuthRequest;
import com.sustainability.tracker.entity.User;
import com.sustainability.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthResponse register(AuthRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return new AuthResponse(false, "Email already exists", null, null, null, null);
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setOauthProvider("LOCAL");

        User saved = userRepository.save(user);

        return new AuthResponse(true, "Registered successfully",
                saved.getId(), saved.getName(), saved.getEmail(), saved.getProfilePicture());
    }

    public AuthResponse login(AuthRequest request) {

        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            return new AuthResponse(false, "User not found", null, null, null, null);
        }

        if (user.getPasswordHash() == null) {
            return new AuthResponse(false, "This email is registered with Google login", null, null, null, null);
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return new AuthResponse(false, "Invalid password", null, null, null, null);
        }

        return new AuthResponse(true, "Login success",
                user.getId(), user.getName(), user.getEmail(), user.getProfilePicture());
    }

    public AuthResponse googleLogin(GoogleAuthRequest request) {

        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            user = new User();
            user.setName(request.getName() != null ? request.getName() : "Google User");
            user.setEmail(request.getEmail());
            user.setOauthProvider("GOOGLE");
            user.setOauthId(request.getGoogleId());
            user.setProfilePicture(request.getProfilePicture());
        } else {
            if (user.getOauthProvider() == null || !user.getOauthProvider().equals("GOOGLE")) {
                user.setOauthProvider("GOOGLE");
            }
            if (user.getOauthId() == null) user.setOauthId(request.getGoogleId());
            if (request.getProfilePicture() != null) user.setProfilePicture(request.getProfilePicture());
            if (request.getName() != null) user.setName(request.getName());
        }

        User saved = userRepository.save(user);

        return new AuthResponse(true, "Google login success",
                saved.getId(), saved.getName(), saved.getEmail(), saved.getProfilePicture());
    }
}