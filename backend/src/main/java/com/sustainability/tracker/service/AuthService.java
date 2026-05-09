package com.sustainability.tracker.service;

import com.sustainability.tracker.dto.AuthRequest;
import com.sustainability.tracker.dto.AuthResponse;
import com.sustainability.tracker.dto.GoogleAuthRequest;
import com.sustainability.tracker.service.GoogleIdTokenVerifierService.VerifiedGoogleClaims;
import com.sustainability.tracker.entity.AdminProfile;
import com.sustainability.tracker.entity.User;
import com.sustainability.tracker.repository.AdminProfileRepository;
import com.sustainability.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String ROLE_USER = "USER";
    private static final String ROLE_ADMIN = "ADMIN";
    private static final String OAUTH_LOCAL = "LOCAL";
    private static final String OAUTH_GOOGLE = "GOOGLE";
    private static final String DEFAULT_ADMIN_ACCESS_LEVEL = "ADMIN";
    private static final String DEFAULT_ADMIN_DEPARTMENT = "Platform Operations";

    private final UserRepository userRepository;
    private final AdminProfileRepository adminProfileRepository;
    private final GoogleIdTokenVerifierService googleIdTokenVerifierService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthResponse register(AuthRequest request) {

        String normalizedName = normalizeName(request.getName());
        String normalizedEmail = normalizeEmail(request.getEmail());

        if (normalizedName.isBlank()) {
            return new AuthResponse(false, "Name is required", null, null, null, null);
        }

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            return new AuthResponse(false, "Email already exists", null, null, null, null);
        }

        User saved = createLocalUser(normalizedName, normalizedEmail, request.getPassword(), ROLE_USER);

        return new AuthResponse(true, "Registered successfully",
                saved.getId(), saved.getName(), saved.getEmail(), saved.getProfilePicture(),
                saved.getRole(), saved.getIsActive());
    }

    public AuthResponse login(AuthRequest request) {

        String normalizedEmail = normalizeEmail(request.getEmail());

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail).orElse(null);

        if (user == null) {
            return new AuthResponse(false, "User not found", null, null, null, null);
        }

        if (ROLE_ADMIN.equalsIgnoreCase(user.getRole())) {
            return new AuthResponse(false, "Please use admin login for admin accounts", null, null, null, null);
        }

        if (user.getPasswordHash() == null) {
            return new AuthResponse(false, "This email is registered with Google login", null, null, null, null);
        }

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            return new AuthResponse(false, "Your account has been deactivated by admin", null, null, null, null);
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return new AuthResponse(false, "Invalid password", null, null, null, null);
        }

        return new AuthResponse(true, "Login success",
                user.getId(), user.getName(), user.getEmail(), user.getProfilePicture(),
                user.getRole(), user.getIsActive());
    }

    public AuthResponse registerAdmin(AuthRequest request) {

        String normalizedName = normalizeName(request.getName());
        String normalizedEmail = normalizeEmail(request.getEmail());

        if (normalizedName.isBlank()) {
            return new AuthResponse(false, "Name is required", null, null, null, null);
        }

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            return new AuthResponse(false, "Email already exists", null, null, null, null);
        }

        User saved = createLocalUser(normalizedName, normalizedEmail, request.getPassword(), ROLE_ADMIN);
        ensureAdminProfile(saved);

        return new AuthResponse(true, "Admin account created successfully",
                saved.getId(), saved.getName(), saved.getEmail(), saved.getProfilePicture(),
                saved.getRole(), saved.getIsActive());
    }

    public AuthResponse loginAdmin(AuthRequest request) {

        String normalizedEmail = normalizeEmail(request.getEmail());
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail).orElse(null);

        if (user == null) {
            return new AuthResponse(false, "Admin not found", null, null, null, null);
        }

        if (!ROLE_ADMIN.equalsIgnoreCase(user.getRole())) {
            return new AuthResponse(false, "This account is not an admin account", null, null, null, null);
        }

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            return new AuthResponse(false, "Admin account is deactivated", null, null, null, null);
        }

        if (user.getPasswordHash() == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return new AuthResponse(false, "Invalid password", null, null, null, null);
        }

        recordAdminLogin(user);

        return new AuthResponse(true, "Admin login success",
                user.getId(), user.getName(), user.getEmail(), user.getProfilePicture(),
                user.getRole(), user.getIsActive());
    }

    public AuthResponse googleLogin(GoogleAuthRequest request) {

        if (!googleIdTokenVerifierService.isConfigured()) {
            return new AuthResponse(false, "Google OAuth is not configured on the server", null, null, null, null);
        }

        VerifiedGoogleClaims claims = googleIdTokenVerifierService.verify(request.getIdToken());
        if (claims == null) {
            return new AuthResponse(false, "Invalid or expired Google token", null, null, null, null);
        }

        if (!claims.emailVerified()) {
            return new AuthResponse(false, "Google account email is not verified", null, null, null, null);
        }

        String normalizedEmail = normalizeEmail(claims.email());
        String normalizedName = normalizeName(claims.name());
        String normalizedGoogleId = claims.googleId().trim();

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail).orElse(null);

        if (user == null) {
            user = new User();
            user.setName(normalizedName.isBlank() ? "Google User" : normalizedName);
            user.setEmail(normalizedEmail);
            user.setOauthProvider(OAUTH_GOOGLE);
            user.setOauthId(normalizedGoogleId);
            user.setProfilePicture(claims.profilePicture());
            user.setRole(ROLE_USER);
            user.setIsActive(true);
        } else {
            if (!Boolean.TRUE.equals(user.getIsActive())) {
                return new AuthResponse(false, "Your account has been deactivated by admin", null, null, null, null);
            }

            if (!OAUTH_GOOGLE.equalsIgnoreCase(user.getOauthProvider())) {
                if (ROLE_ADMIN.equalsIgnoreCase(user.getRole())) {
                    return new AuthResponse(false, "Admin accounts cannot use Google login unless explicitly linked", null, null, null, null);
                }
                return new AuthResponse(false, "This account uses password login. Link Google first before using Google login", null, null, null, null);
            }

            if (user.getOauthId() == null || user.getOauthId().isBlank()) {
                user.setOauthId(normalizedGoogleId);
            } else if (!normalizedGoogleId.equals(user.getOauthId())) {
                return new AuthResponse(false, "Google account does not match the linked account", null, null, null, null);
            }

            if (claims.profilePicture() != null && !claims.profilePicture().isBlank()) {
                user.setProfilePicture(claims.profilePicture());
            }
            if (!normalizedName.isBlank()) user.setName(normalizedName);
            if (user.getRole() == null || user.getRole().isBlank()) {
                user.setRole(ROLE_USER);
            }
        }

        User saved = userRepository.save(user);

        return new AuthResponse(true, "Google login success",
                saved.getId(), saved.getName(), saved.getEmail(), saved.getProfilePicture(),
                saved.getRole(), saved.getIsActive());
    }

    private User createLocalUser(String name, String email, String password, String role) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setOauthProvider(OAUTH_LOCAL);
        user.setRole(role);
        user.setIsActive(true);
        return userRepository.save(user);
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return "";
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeName(String name) {
        if (name == null) {
            return "";
        }
        return name.trim().replaceAll("\\s+", " ");
    }

    private void ensureAdminProfile(User user) {
        adminProfileRepository.findByUser_Id(user.getId())
                .orElseGet(() -> adminProfileRepository.save(buildAdminProfile(user)));
    }

    private void recordAdminLogin(User user) {
        AdminProfile profile = adminProfileRepository.findByUser_Id(user.getId())
                .orElseGet(() -> buildAdminProfile(user));
        profile.setLastLoginAt(LocalDateTime.now());
        adminProfileRepository.save(profile);
    }

    private AdminProfile buildAdminProfile(User user) {
        AdminProfile profile = new AdminProfile();
        profile.setUser(user);
        profile.setAccessLevel(DEFAULT_ADMIN_ACCESS_LEVEL);
        profile.setDepartment(DEFAULT_ADMIN_DEPARTMENT);
        return profile;
    }
}