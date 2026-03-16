package com.carboncalc.app.repository;

import com.carboncalc.app.entity.Badge;
import com.carboncalc.app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BadgeRepository extends JpaRepository<Badge, Long> {
    List<Badge> findByUser(User user);
}