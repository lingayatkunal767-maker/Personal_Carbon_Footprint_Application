package com.sustainability.tracker.service;

import com.sustainability.tracker.entity.Badge;
import com.sustainability.tracker.repository.BadgeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BadgeService {

    private final BadgeRepository badgeRepository;

    public List<Badge> getBadgesByUser(Long userId) {
        return badgeRepository.findByUserIdOrderByEarnedDateDesc(userId);
    }
}
