package com.carbon.carbon.repository;

import com.carbon.carbon.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {
    Optional<OtpToken> findTopByEmailAndUsedFalseOrderByExpiryDateDesc(String email);
}
