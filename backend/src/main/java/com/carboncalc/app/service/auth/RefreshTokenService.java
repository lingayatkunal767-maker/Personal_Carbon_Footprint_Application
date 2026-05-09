package com.carboncalc.app.service.auth;

import com.carboncalc.app.entity.AuthToken;
import com.carboncalc.app.entity.User;
import com.carboncalc.app.repository.AuthTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final AuthTokenRepository authTokenRepository;

    public String createRefreshToken(User user) {
        String token = UUID.randomUUID().toString();

        AuthToken authToken = authTokenRepository.findByUser(user)
                .orElse(AuthToken.builder().user(user).build());

        authToken.setRefreshToken(token);
        authToken.setExpiresAt(LocalDateTime.now().plusDays(7));

        authTokenRepository.save(authToken);
        return token;
    }

    public User validateRefreshToken(String refreshToken) {
        AuthToken authToken = authTokenRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (authToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Refresh token expired");
        }

        return authToken.getUser();
    }

    public void deleteByRefreshToken(String refreshToken) {
        authTokenRepository.findByRefreshToken(refreshToken)
                .ifPresent(authTokenRepository::delete);
    }
}