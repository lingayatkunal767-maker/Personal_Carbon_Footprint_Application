package com.carboncalc.backend.repository;

import com.carboncalc.backend.entity.Survey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SurveyRepository extends JpaRepository<Survey, Long> {

    List<Survey> findByUserIdOrderByDateDesc(Long userId);

    Optional<Survey> findFirstByUserIdOrderByDateDesc(Long userId);

    long countByUserId(Long userId);

    // Surveys submitted after a specific date (used for goal progress)
    List<Survey> findByUserIdAndDateAfter(Long userId, LocalDateTime after);
}
