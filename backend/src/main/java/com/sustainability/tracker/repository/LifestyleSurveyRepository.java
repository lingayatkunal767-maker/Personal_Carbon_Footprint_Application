package com.sustainability.tracker.repository;

import com.sustainability.tracker.entity.LifestyleSurvey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LifestyleSurveyRepository extends JpaRepository<LifestyleSurvey, Long> {
}
