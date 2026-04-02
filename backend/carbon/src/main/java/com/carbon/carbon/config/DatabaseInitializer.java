package com.carbon.carbon.config;

import com.carbon.carbon.entity.Marketplace;
import com.carbon.carbon.entity.Notification;
import com.carbon.carbon.repository.MarketplaceRepository;
import com.carbon.carbon.repository.NotificationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Configuration
public class DatabaseInitializer {

    @Bean
    public CommandLineRunner initMarketplaceData(MarketplaceRepository marketplaceRepository, NotificationRepository notificationRepository) {
        return args -> {
            if (marketplaceRepository.count() == 0) {
                log.info("Marketplace is empty. Seeding initial data...");

                List<Marketplace> items = List.of(
                        createItem("Eco-Friendly Cookstove", "Provide clean cookstoves to reduce indoor pollution.", new BigDecimal("3749"), "SUSTAINABLE LIVING", 400),
                        createItem("Green Commute Pass", "Support electric buses and bike-sharing systems.", new BigDecimal("1500"), "ENVIRONMENTAL", 120),
                        createItem("Rainwater Harvesting Kit", "Promote water conservation in urban homes.", new BigDecimal("5500"), "SUSTAINABLE LIVING", 210),
                        createItem("Solar Panel Contribution", "Help communities switch to clean solar energy.", new BigDecimal("2000"), "RENEWABLE ENERGY", 500),
                        createItem("Reforestation Project", "Plant resilient tree species in deforested areas.", new BigDecimal("800"), "CARBON OFFSET", 150),
                        createItem("Ocean Plastic Cleanup", "Fund vessels and nets to clean marine environments.", new BigDecimal("1200"), "ENVIRONMENTAL", 80),
                        createItem("Wind Farm Investment", "Invest in micro-wind turbines for rural areas.", new BigDecimal("4500"), "RENEWABLE ENERGY", 600),
                        createItem("Bamboo Toothbrush Set", "Switch to biodegradable everyday household items.", new BigDecimal("450"), "SUSTAINABLE LIVING", 10),
                        createItem("Mangrove Restoration", "Restore coastal mangroves that absorb high CO2.", new BigDecimal("1000"), "CARBON OFFSET", 300),
                        createItem("Energy Efficient LED Pack", "Subsidize LEDs for low-income households.", new BigDecimal("600"), "RENEWABLE ENERGY", 45),
                        createItem("Composting Bin Program", "Provide bins to reduce organic waste in landfills.", new BigDecimal("2500"), "SUSTAINABLE LIVING", 90),
                        createItem("Direct Air Capture", "Support cutting-edge carbon removal tech.", new BigDecimal("5000"), "CARBON OFFSET", 1000)
                );

                marketplaceRepository.saveAll(items);
                log.info("Seeded 12 marketplace items successfully.");
            } else {
                log.info("Marketplace data already exists. Skipping seeding.");
            }
            
            if (notificationRepository.count() == 0) {
                log.info("Notifications table is empty. Seeding initial data...");
                
                List<Notification> notifs = List.of(
                    createNotification(1L, "Congratulations! You completed your goal: Reduce monthly emissions by 20%.", "GOAL"),
                    createNotification(1L, "You earned the Eco Starter badge! Keep up the great work.", "BADGE"),
                    createNotification(1L, "Your rank improved! You are now ranked #3 on the leaderboard.", "LEADERBOARD"),
                    createNotification(1L, "High emission alert: Your daily emission of 68 kg CO2e exceeds the recommended limit.", "EMISSION"),
                    createNotification(1L, "Your purchase of Plant 10 Trees (₹2,099) has been confirmed.", "PURCHASE")
                );
                
                notificationRepository.saveAll(notifs);
                log.info("Seeded 5 notification items successfully.");
            }
        };
    }

    private Notification createNotification(Long userId, String message, String category) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setMessage(message);
        n.setCategory(category);
        n.setIsRead(false);
        return n;
    }

    private Marketplace createItem(String name, String description, BigDecimal price, String category, Integer offset) {
        Marketplace m = new Marketplace();
        m.setItemName(name);
        m.setDescription(description);
        m.setItemPrice(price);
        m.setCategory(category);
        m.setCarbonOffset(offset);
        return m;
    }
}
