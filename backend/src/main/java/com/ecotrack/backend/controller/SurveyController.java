package com.ecotrack.backend.controller;

import com.ecotrack.backend.entity.CarbonEntry;
import com.ecotrack.backend.entity.LifestyleSurvey;
import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.repository.CarbonEntryRepository;
import com.ecotrack.backend.repository.SurveyRepository;
import com.ecotrack.backend.repository.UserBadgeRepository;
import com.ecotrack.backend.service.BadgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/survey")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class SurveyController {

    private final SurveyRepository surveyRepo;
    private final CarbonEntryRepository carbonRepo;
    private final BadgeService badgeService;
    private final UserBadgeRepository userBadgeRepository;

    @GetMapping
    public ResponseEntity<?> get(@AuthenticationPrincipal User user) {
        return surveyRepo.findByUser(user)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(null));
    }

    @PostMapping
    public ResponseEntity<?> save(
            @AuthenticationPrincipal User user,
            @RequestBody LifestyleSurvey req) {

        // 1. Save or update the survey
        LifestyleSurvey s = surveyRepo.findByUser(user).orElse(new LifestyleSurvey());
        s.setUser(user);
        s.setPrimaryTransport(req.getPrimaryTransport());
        s.setWeeklyDrivingKm(req.getWeeklyDrivingKm());
        s.setCarType(req.getCarType());
        s.setHomeHeating(req.getHomeHeating());
        s.setMonthlyElectricityKwh(req.getMonthlyElectricityKwh());
        s.setHasRenewableEnergy(req.getHasRenewableEnergy());
        s.setDietType(req.getDietType());
        s.setMeatMealsPerWeek(req.getMeatMealsPerWeek());
        s.setBuysLocalFood(req.getBuysLocalFood());
        s.setShoppingHabits(req.getShoppingHabits());
        s.setBuysSecondHand(req.getBuysSecondHand());
        s.setShortFlightsPerYear(req.getShortFlightsPerYear());
        s.setLongFlightsPerYear(req.getLongFlightsPerYear());

        // 2. Calculate annual footprint estimates
        double transportKg = 0, energyKg = 0, foodKg = 0;

        // Transport Calculation
        if ("car".equalsIgnoreCase(req.getPrimaryTransport())) {
            double wkm = req.getWeeklyDrivingKm() != null ? req.getWeeklyDrivingKm() : 0;
            double factor = "electric".equalsIgnoreCase(req.getCarType()) ? 0.05 : 0.21;
            transportKg = wkm * 52 * factor;
        } else if ("bus".equalsIgnoreCase(req.getPrimaryTransport())) {
            double wkm = req.getWeeklyDrivingKm() != null ? req.getWeeklyDrivingKm() : 0;
            transportKg = wkm * 52 * 0.089;
        } else if ("train".equalsIgnoreCase(req.getPrimaryTransport())) {
            double wkm = req.getWeeklyDrivingKm() != null ? req.getWeeklyDrivingKm() : 0;
            transportKg = wkm * 52 * 0.041;
        }

        if (req.getShortFlightsPerYear() != null) transportKg += req.getShortFlightsPerYear() * 250;
        if (req.getLongFlightsPerYear()  != null) transportKg += req.getLongFlightsPerYear()  * 1500;

        // Energy Calculation
        if (req.getMonthlyElectricityKwh() != null) {
            double renewFactor = Boolean.TRUE.equals(req.getHasRenewableEnergy()) ? 0.05 : 0.5;
            energyKg = req.getMonthlyElectricityKwh() * 12 * renewFactor;
        }

        // Food Calculation
        foodKg = switch (req.getDietType() != null ? req.getDietType().toLowerCase() : "omnivore") {
            case "vegan"      -> 600;
            case "vegetarian" -> 900;
            case "pescatarian"-> 1100;
            default           -> 2000;
        };
        if (req.getMeatMealsPerWeek() != null && req.getMeatMealsPerWeek() > 7) {
            foodKg += (req.getMeatMealsPerWeek() - 7) * 52 * 2.5;
        }

        double totalAnnual = transportKg + energyKg + foodKg;
        s.setEstimatedAnnualFootprint(Math.round(totalAnnual * 10.0) / 10.0);
        surveyRepo.save(s);

        // 3. Update Today's Carbon Entries
        LocalDate today = LocalDate.now();
        List<CarbonEntry> existing = carbonRepo.findByUserOrderByDateDescCreatedAtDesc(user);
        existing.stream()
                .filter(e -> e.getDate().equals(today) && e.getActivity().startsWith("[Survey]"))
                .forEach(carbonRepo::delete);

        double transportDaily = round1(transportKg / 365);
        double energyDaily    = round1(energyKg / 365);
        double foodDaily      = round1(foodKg / 365);

        if (transportDaily > 0) saveDailyEntry(user, "transport", transportDaily, today);
        if (energyDaily > 0)    saveDailyEntry(user, "energy", energyDaily, today);
        if (foodDaily > 0)      saveDailyEntry(user, "food", foodDaily, today);

        // 4. Milestone 4 Logic: Award "Eco Starter" Badge
        boolean isNewBadge = !userBadgeRepository.existsByUserIdAndBadgeName(user.getId(), "Eco Starter");
        badgeService.awardBadge(user.getId(), "Eco Starter");

        Map<String, Object> response = new HashMap<>();
        response.put("survey", s);
        response.put("newBadge", isNewBadge ? "Eco Starter" : null);

        return ResponseEntity.ok(response);
    }

    private void saveDailyEntry(User user, String cat, double amt, LocalDate date) {
        carbonRepo.save(CarbonEntry.builder()
                .user(user).category(cat)
                .activity("[Survey] Daily " + cat + " estimate")
                .amount(amt).unit("kg CO2")
                .notes("Auto-generated from lifestyle survey")
                .date(date).createdAt(LocalDateTime.now()).build());
    }

    private double round1(double v) { return Math.round(v * 10.0) / 10.0; }
}