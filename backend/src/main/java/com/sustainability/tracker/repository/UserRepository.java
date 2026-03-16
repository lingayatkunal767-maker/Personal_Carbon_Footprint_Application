package com.sustainability.tracker.repository;

import com.sustainability.tracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByOauthProviderAndOauthId(String oauthProvider, String oauthId);

    boolean existsByEmail(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<User> findByRoleOrderByCreatedAtDesc(String role);

    long countByRole(String role);

    long countByRoleAndIsActive(String role, Boolean isActive);
}
