package com.sustainability.tracker.repository;

import com.sustainability.tracker.entity.LifestyleSurvey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LifestyleSurveyRepository extends JpaRepository<LifestyleSurvey, Long> {

	List<LifestyleSurvey> findAllByOrderBySurveyDateDesc();

	List<LifestyleSurvey> findBySurveyDateBetweenOrderBySurveyDateDesc(LocalDate from, LocalDate to);

	Optional<LifestyleSurvey> findTopByUserIdOrderBySurveyDateDescIdDesc(Long userId);
}
