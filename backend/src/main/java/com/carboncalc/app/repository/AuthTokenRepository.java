package com.carboncalc.app.repository;

import com.carboncalc.app.entity.AuthToken;
import com.carboncalc.app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuthTokenRepository extends JpaRepository<AuthToken, Long> {
    Optional<AuthToken> findByUser(User user);
    Optional<AuthToken> findByRefreshToken(String refreshToken);
}