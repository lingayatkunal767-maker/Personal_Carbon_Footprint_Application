package com.carbon.carbontracker.controller;

import com.carbon.carbontracker.dto.RegisterRequest;
import com.carbon.carbontracker.service.UserService;
import com.carbon.carbontracker.util.PasswordValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import com.carbon.carbontracker.config.JwtUtil;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Value("${spring.security.oauth2.client.registration.google.client-id:optional}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.github.client-id:optional}")
    private String githubClientId;

    private static boolean isOAuthConfigured(String clientId) {
        return clientId != null && !clientId.isBlank() && !"optional".equals(clientId.trim());
    }

    @GetMapping("/oauth-enabled")
    public ResponseEntity<Map<String, Boolean>> oauthEnabled() {
        return ResponseEntity.ok(Map.of(
                "google", isOAuthConfigured(googleClientId),
                "github", isOAuthConfigured(githubClientId)
        ));
    }

   @PostMapping("/register")
public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

    String response = userService.registerUser(request);

    if (response.equals("Email already exists!")) {
        return ResponseEntity.badRequest().body(response);
    }
    if (response.equals(PasswordValidator.REQUIREMENT_MSG)) {
        return ResponseEntity.badRequest().body(response);
    }

    return ResponseEntity.ok(response);
}

@Autowired
private JwtUtil jwtUtil;

@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody RegisterRequest request) {

    boolean isValid = userService.validateUser(request.getEmail(), request.getPassword());

    if (!isValid) {
        return ResponseEntity.badRequest().body("Invalid credentials");
    }

    String token = jwtUtil.generateToken(request.getEmail());

    Optional<?> userOpt = userService.getUserByEmail(request.getEmail());

    if (userOpt.isEmpty()) {
        return ResponseEntity.badRequest().body("User not found");
    }

    com.carbon.carbontracker.model.User user =
            (com.carbon.carbontracker.model.User) userOpt.get();

    return ResponseEntity.ok(Map.of(
            "token", token,
            "role", user.getRole()
    ));
}

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body != null ? body.get("email") : null;
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body("Email is required");
        }
        var resultOpt = userService.requestPasswordReset(email.trim());
        if (resultOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "userFound", false,
                    "message", "No account found with this email. Please register first."
            ));
        }
        var result = resultOpt.get();
        if (result.isEmailSent()) {
            return ResponseEntity.ok(Map.of(
                    "userFound", true,
                    "message", "A 6-digit OTP has been sent to your email. Valid for 10 minutes. Check your inbox (and spam)."
            ));
        }
        // For security, never expose the OTP in API responses.
        // If email sending fails, still return a generic message.
        return ResponseEntity.ok(Map.of(
                "userFound", true,
                "message", "A 6-digit OTP has been generated. Please check your email. If you do not receive it, try again or contact support."
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String email = body != null ? body.get("email") : null;
        String otp = body != null ? body.get("otp") : null;
        String newPassword = body != null ? body.get("newPassword") : null;
        if (email == null || email.isBlank() || otp == null || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body("Email, OTP and new password are required");
        }
        if (!PasswordValidator.isValid(newPassword)) {
            return ResponseEntity.badRequest().body(PasswordValidator.REQUIREMENT_MSG);
        }
        boolean success = userService.resetPasswordWithOtp(email.trim(), otp, newPassword);
        if (!success) {
            return ResponseEntity.badRequest().body("Invalid or expired OTP. Please request a new one.");
        }
        return ResponseEntity.ok("Password has been reset. You can now log in.");
    }

    @GetMapping("/api/test")
    public String test() {
        return "Protected API working!";
    }

@GetMapping("/me")
public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String authHeader) {

    String token = authHeader.replace("Bearer ", "");
    String email = jwtUtil.extractEmail(token);

    Optional<?> userOpt = userService.getUserByEmail(email);

    if (userOpt.isEmpty()) {
        return ResponseEntity.status(404).body("User not found");
    }

    com.carbon.carbontracker.model.User user =
            (com.carbon.carbontracker.model.User) userOpt.get();

    return ResponseEntity.ok(Map.of(
            "name", user.getName(),
            "email", user.getEmail(),
            "role", user.getRole()
    ));
}

@PutMapping("/profile")
public ResponseEntity<?> updateProfile(
        @RequestHeader("Authorization") String authHeader,
        @RequestBody Map<String, String> body) {

    String token = authHeader.replace("Bearer ", "");
    String email = jwtUtil.extractEmail(token);

    String name = body.get("name");
    String newEmail = body.get("email");
    String password = body.get("password");

    boolean updated = userService.updateUserProfile(email, name, newEmail, password);

    if (!updated) {
        return ResponseEntity.badRequest().body("Profile update failed");
    }

    return ResponseEntity.ok("Profile updated successfully");
}
}
