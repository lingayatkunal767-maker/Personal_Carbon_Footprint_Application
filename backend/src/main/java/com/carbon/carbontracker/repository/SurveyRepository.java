package com.carbon.carbontracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.carbon.carbontracker.model.Survey;
public interface SurveyRepository extends JpaRepository<Survey, Long> {
}