package com.carboncalc.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
@SpringBootApplication
@EnableScheduling
public class CarbonCalcApplication {

    public static void main(String[] args) {
        SpringApplication.run(CarbonCalcApplication.class, args);
    }
}