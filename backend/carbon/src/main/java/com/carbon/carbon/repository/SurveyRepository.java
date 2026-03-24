package com.carbon.carbon.repository;

import com.carbon.carbon.entity.Survey;
import com.carbon.carbon.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SurveyRepository extends JpaRepository<Survey, Long> {
    long countByUser(User user);
}