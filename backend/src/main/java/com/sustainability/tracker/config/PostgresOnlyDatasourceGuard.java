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
        if (datasourceUrl == null || !datasourceUrl.startsWith("jdbc:postgresql:")) {
            throw new IllegalStateException(
                    "Invalid datasource: backend is configured to run only with PostgreSQL. "
                            + "Current spring.datasource.url=" + datasourceUrl);
        }
    }
}
