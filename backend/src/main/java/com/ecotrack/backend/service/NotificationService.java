package com.ecotrack.backend.service;

import com.ecotrack.backend.entity.Notification;
import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.repository.NotificationRepository;
import com.ecotrack.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notifRepo;
    private final UserRepository         userRepo;

    /** Core helper — saves one notification for one user */
    public void notify(User user, String title, String body, String type) {
        Notification n = new Notification();
        n.setUser(user);
        n.setTitle(title);
        n.setBody(body);
        n.setType(type != null ? type : "general");
        n.setRead(false);
        n.setCreatedAt(LocalDateTime.now());
        notifRepo.save(n);
    }

    /** Called by BadgeService when user earns a badge */
    public void notifyBadgeEarned(User user, String badgeName) {
        notify(user,
            "🏅 Badge Unlocked: " + badgeName,
            "Congratulations! You earned the \"" + badgeName + "\" badge. Keep it up!",
            "badge"
        );
    }

    /** Called by GoalService when a goal reaches 100% */
    public void notifyGoalCompleted(User user, String goalTitle) {
        notify(user,
            "🎯 Goal Completed!",
            "You completed \"" + goalTitle + "\". Excellent progress on your sustainability journey!",
            "goal"
        );
    }

    /** Called by MarketplaceService after a successful purchase */
    public void notifyPurchase(User user, String itemName, Double offsetKg) {
        notify(user,
            "✅ Purchase Confirmed: " + itemName,
            "Your eco-action purchase was successful! You offset " + offsetKg + " kg CO₂e. Thank you!",
            "purchase"
        );
    }

    /** Called by AdminController — sends to every user */
    @Transactional
    public int broadcastToAll(String title, String body, String type) {
        List<User> all = userRepo.findAll();

        System.out.println("Users count: " + all.size());

        for (User u : all) {
            try {
                System.out.println("Sending to user: " + u.getEmail());

                notify(u, title, body, type);

            } catch (Exception e) {
                System.out.println("ERROR for user: " + u.getId());
                e.printStackTrace();   // 🔥 THIS LINE IS IMPORTANT
            }
        }
        return all.size();
    }
}
