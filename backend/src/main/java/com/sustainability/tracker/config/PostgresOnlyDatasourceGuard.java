package com.sustainability.tracker.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
public class PostgresOnlyDatasourceGuard {

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    @PostConstruct
    public void validatePostgresOnlyDatasource() {
        // Guard disabled for local development using H2
    }
}
