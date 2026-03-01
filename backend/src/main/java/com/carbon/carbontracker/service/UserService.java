package com.carbon.carbontracker.service;

import com.carbon.carbontracker.dto.OtpResult;
import com.carbon.carbontracker.dto.RegisterRequest;
import com.carbon.carbontracker.model.User;
import com.carbon.carbontracker.repository.UserRepository;
import com.carbon.carbontracker.util.PasswordValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;


    public String registerUser(RegisterRequest request) {
        if (!PasswordValidator.isValid(request.getPassword())) {
            return PasswordValidator.REQUIREMENT_MSG;
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return "Email already exists!";
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);

        return "User registered successfully!";
    }
    public boolean validateUser(String email, String password) {

    User user = userRepository.findByEmail(email)
            .orElse(null);

    if (user == null) {
        return false;
    }

    return passwordEncoder.matches(password, user.getPassword());
}

    private static final int OTP_EXPIRY_MINUTES = 10;
    private static final Random RANDOM = new Random();

    /**
     * Request password reset: generates a 6-digit OTP, saves it with 10-minute expiry,
     * and sends it by email if mail is configured. Returns OtpResult when user exists
     * (emailSent=true and otp=null when sent by email; emailSent=false and otp set when not sent, for dev).
     */
    public Optional<OtpResult> requestPasswordReset(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return Optional.empty();
        }
        User user = userOpt.get();
        int otp = 100000 + RANDOM.nextInt(900000);
        String otpStr = String.valueOf(otp);
        user.setResetToken(otpStr);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        userRepository.save(user);

        boolean emailSent = emailService.sendOtpEmail(email, otpStr);
        if (emailSent) {
            return Optional.of(new OtpResult(true, null));
        }
        return Optional.of(new OtpResult(false, otpStr));
    }

    /**
     * Reset password using email and OTP. Returns true if successful.
     */
   public boolean resetPasswordWithOtp(String email, String otp, String newPassword) {

    Optional<User> userOpt = userRepository.findByEmail(email);
    if (userOpt.isEmpty()) {
        return false;
    }

    User user = userOpt.get();

    // 1️⃣ Check if OTP exists
    if (user.getResetToken() == null) {
        return false;
    }

    // 2️⃣ Check if OTP matches
    if (!user.getResetToken().equals(otp)) {
        return false;
    }

    // 3️⃣ Check expiry
    if (user.getResetTokenExpiry() == null ||
        user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
        return false;
    }

    // 4️⃣ Encode and save new password
    user.setPassword(passwordEncoder.encode(newPassword));

    // 5️⃣ Clear OTP after successful reset
    user.setResetToken(null);
    user.setResetTokenExpiry(null);

    userRepository.save(user);

    return true;
}
}
