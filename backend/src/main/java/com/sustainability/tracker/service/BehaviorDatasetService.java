package com.sustainability.tracker.service;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.InvalidPathException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Slf4j
public class BehaviorDatasetService {

    private static final int K_NEIGHBORS = 9;
    private static final BigDecimal DEFAULT_BLEND_WEIGHT = new BigDecimal("0.30");

    private final String datasetPath;
    private final BigDecimal blendWeight;

    private List<BehaviorRow> datasetRows = List.of();
    private NumericRanges numericRanges = NumericRanges.empty();

    public BehaviorDatasetService(
            @Value("${carbon.behavior.dataset.path:data/personal_carbon_footprint_behavior.csv}") String datasetPath,
            @Value("${carbon.behavior.blend-weight:0.30}") BigDecimal blendWeight
    ) {
        this.datasetPath = datasetPath;
        this.blendWeight = sanitizeBlendWeight(blendWeight);
    }

    @PostConstruct
    void initialize() {
        loadDataset();
    }

    public BehaviorPrediction predict(BehaviorProfile profile) {
        if (profile == null || datasetRows.isEmpty()) {
            return new BehaviorPrediction(null, null, false, 0);
        }

        List<ScoredRow> nearest = datasetRows.stream()
                .map(row -> new ScoredRow(row, calculateDistance(row, profile)))
                .sorted(Comparator.comparingDouble(ScoredRow::distance))
                .limit(K_NEIGHBORS)
                .toList();

        if (nearest.isEmpty()) {
            return new BehaviorPrediction(null, null, false, 0);
        }

        BigDecimal total = nearest.stream()
                .map(scored -> scored.row().carbonFootprintKg())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal predicted = total.divide(BigDecimal.valueOf(nearest.size()), 2, RoundingMode.HALF_UP);

        String impactLevel = nearest.stream()
                .map(scored -> normalizeToken(scored.row().impactLevel()))
                .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()))
                .entrySet()
                .stream()
                .max(Comparator.<Map.Entry<String, Long>>comparingLong(Map.Entry::getValue)
                        .thenComparing(Map.Entry::getKey))
                .map(entry -> formatToken(entry.getKey()))
                .orElse(classifyImpact(predicted));

        return new BehaviorPrediction(predicted, impactLevel, true, nearest.size());
    }

    public BigDecimal getBlendWeight() {
        return blendWeight;
    }

        public DatasetInsights generateInsights(BehaviorProfile profile) {
        if (datasetRows.isEmpty()) {
            return new DatasetInsights(false, 0, null, null, null, null, 0, List.of());
        }

        List<BehaviorRow> lowImpactRows = getLowImpactRows();
        BigDecimal datasetAverage = averageFootprint(datasetRows);
        BigDecimal lowImpactAverage = averageFootprint(lowImpactRows);

        BehaviorPrediction prediction = profile != null
            ? predict(profile)
            : new BehaviorPrediction(null, null, true, 0);

        List<DatasetTip> tips = buildDatasetTips(profile, lowImpactRows, datasetAverage, lowImpactAverage);

        return new DatasetInsights(
            true,
            datasetRows.size(),
            datasetAverage,
            lowImpactAverage,
            prediction.predictedFootprint(),
            prediction.impactLevel(),
            prediction.matchedSamples(),
            tips
        );
        }

        private List<BehaviorRow> getLowImpactRows() {
        List<BehaviorRow> lowImpactRows = datasetRows.stream()
            .filter(row -> "LOW".equals(normalizeToken(row.impactLevel())))
            .toList();

        if (!lowImpactRows.isEmpty()) {
            return lowImpactRows;
        }

        int fallbackSize = Math.max(1, Math.min(50, datasetRows.size() / 4));
        return datasetRows.stream()
            .sorted(Comparator.comparing(BehaviorRow::carbonFootprintKg))
            .limit(fallbackSize)
            .toList();
        }

        private BigDecimal averageFootprint(List<BehaviorRow> rows) {
        if (rows == null || rows.isEmpty()) {
            return BigDecimal.ZERO;
        }
        BigDecimal total = rows.stream()
            .map(BehaviorRow::carbonFootprintKg)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        return total.divide(BigDecimal.valueOf(rows.size()), 2, RoundingMode.HALF_UP);
        }

        private BigDecimal averageValue(List<BehaviorRow> rows, Function<BehaviorRow, BigDecimal> selector, int scale) {
        if (rows == null || rows.isEmpty()) {
            return BigDecimal.ZERO;
        }
        BigDecimal total = rows.stream()
            .map(selector)
            .filter(value -> value != null)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        return total.divide(BigDecimal.valueOf(rows.size()), scale, RoundingMode.HALF_UP);
        }

        private String dominantToken(List<BehaviorRow> rows, Function<BehaviorRow, String> selector, String fallback) {
        return rows.stream()
            .map(selector)
            .map(this::normalizeToken)
            .filter(token -> !token.isBlank())
            .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()))
            .entrySet()
            .stream()
            .max(Comparator.<Map.Entry<String, Long>>comparingLong(Map.Entry::getValue)
                .thenComparing(Map.Entry::getKey))
            .map(Map.Entry::getKey)
            .orElse(fallback);
        }

        private List<DatasetTip> buildDatasetTips(
            BehaviorProfile profile,
            List<BehaviorRow> lowImpactRows,
            BigDecimal datasetAverage,
            BigDecimal lowImpactAverage
        ) {
        String lowImpactTransport = displayTransport(
            dominantToken(lowImpactRows, row -> normalizeTransport(row.transportMode()), "WALK")
        );
        String lowImpactFood = displayFood(
            dominantToken(lowImpactRows, row -> normalizeFood(row.foodType()), "VEG")
        );

        BigDecimal lowImpactRenewable = averageValue(lowImpactRows, BehaviorRow::renewableUsagePct, 0);
        BigDecimal lowImpactWaste = averageValue(lowImpactRows, BehaviorRow::wasteGeneratedKg, 2);
        BigDecimal lowImpactEcoActions = averageValue(
            lowImpactRows,
            row -> BigDecimal.valueOf(row.ecoActions()),
            1
        );

        BigDecimal potentialReduction = datasetAverage.subtract(lowImpactAverage).max(BigDecimal.ZERO);
        if (potentialReduction.compareTo(BigDecimal.ZERO) == 0) {
            potentialReduction = new BigDecimal("1.50");
        }

        String transportDescription = profile != null
            ? String.format(
                "Your latest survey aligns against %d dataset samples. Low-impact users most often use %s.",
                K_NEIGHBORS,
                lowImpactTransport
            )
            : String.format(
                "Across the connected dataset, low-impact users most often use %s for day-to-day travel.",
                lowImpactTransport
            );

        String renewableDescription = String.format(
            "Low-impact dataset users average %s%% renewable usage. Increase clean-energy share where possible.",
            lowImpactRenewable.stripTrailingZeros().toPlainString()
        );

        String foodDescription = String.format(
            "Low-impact users are mostly %s diets in the dataset. Reducing high-impact meals lowers your daily footprint.",
            lowImpactFood
        );

        String actionsDescription = String.format(
            "Low-impact profiles average %s kg waste/day and %s eco actions/day. Small daily actions compound quickly.",
            lowImpactWaste.stripTrailingZeros().toPlainString(),
            lowImpactEcoActions.stripTrailingZeros().toPlainString()
        );

        return List.of(
            new DatasetTip(
                "dataset-transport",
                "🚶",
                "#d4edda",
                "Shift Trips To Low-Impact Transport",
                transportDescription,
                savingsLabel(potentialReduction.multiply(new BigDecimal("0.45")))
            ),
            new DatasetTip(
                "dataset-renewable",
                "☀️",
                "#fef3d4",
                "Increase Renewable Energy Share",
                renewableDescription,
                savingsLabel(potentialReduction.multiply(new BigDecimal("0.25")))
            ),
            new DatasetTip(
                "dataset-food",
                "🥗",
                "#dceefb",
                "Follow Lower-Impact Food Patterns",
                foodDescription,
                savingsLabel(potentialReduction.multiply(new BigDecimal("0.20")))
            ),
            new DatasetTip(
                "dataset-actions",
                "♻️",
                "#fde8e8",
                "Lower Waste And Raise Eco Actions",
                actionsDescription,
                savingsLabel(potentialReduction.multiply(new BigDecimal("0.10")))
            )
        );
        }

        private String savingsLabel(BigDecimal value) {
        BigDecimal safeValue = value.max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
        return "Save ~" + safeValue.stripTrailingZeros().toPlainString() + " kg CO2e/day";
        }

        private String displayTransport(String token) {
        String normalized = normalizeToken(token);
        return switch (normalized) {
            case "EV" -> "EV";
            case "CAR" -> "Car";
            case "BUS" -> "Bus";
            case "BIKE" -> "Bike";
            case "WALK" -> "Walk";
            default -> formatToken(normalized);
        };
        }

        private String displayFood(String token) {
        String normalized = normalizeToken(token);
        return switch (normalized) {
            case "NON-VEG" -> "Non-Veg";
            case "MIXED" -> "Mixed";
            case "VEG" -> "Veg";
            default -> formatToken(normalized);
        };
        }

    private void loadDataset() {
        Optional<Path> datasetFile = resolveDatasetPath();
        if (datasetFile.isEmpty()) {
            log.warn("Behavior dataset file not found. Checked path: {}", datasetPath);
            return;
        }

        List<BehaviorRow> loadedRows = new ArrayList<>();
        try (BufferedReader reader = Files.newBufferedReader(datasetFile.get(), StandardCharsets.UTF_8)) {
            String line = reader.readLine(); // header
            int lineNumber = 1;
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                if (line.isBlank()) {
                    continue;
                }
                BehaviorRow row = parseLine(line, lineNumber);
                if (row != null) {
                    loadedRows.add(row);
                }
            }
        } catch (IOException ex) {
            log.error("Failed to load behavior dataset from {}", datasetFile.get(), ex);
            return;
        }

        if (loadedRows.isEmpty()) {
            log.warn("Behavior dataset was loaded but no valid rows were parsed from {}", datasetFile.get());
            return;
        }

        datasetRows = List.copyOf(loadedRows);
        numericRanges = NumericRanges.fromRows(datasetRows);
        log.info("Behavior dataset connected with {} records from {}", datasetRows.size(), datasetFile.get());
    }

    private Optional<Path> resolveDatasetPath() {
        List<Path> candidates = new ArrayList<>();
        try {
            Path configured = Paths.get(datasetPath);
            candidates.add(configured);
            if (!configured.isAbsolute()) {
                candidates.add(Paths.get("backend").resolve(datasetPath));
                candidates.add(Paths.get("..").resolve("backend").resolve(datasetPath));
            }
        } catch (InvalidPathException ex) {
            log.warn("Invalid behavior dataset path configured: {}", datasetPath, ex);
            return Optional.empty();
        }

        return candidates.stream()
                .map(Path::normalize)
                .filter(path -> Files.exists(path) && Files.isRegularFile(path))
                .findFirst();
    }

    private BehaviorRow parseLine(String line, int lineNumber) {
        String[] columns = line.split(",", -1);
        if (columns.length < 12) {
            log.debug("Skipping malformed behavior dataset row {}", lineNumber);
            return null;
        }

        try {
            return new BehaviorRow(
                    columns[1].trim(),
                    columns[2].trim(),
                    parseBigDecimal(columns[3]),
                    parseBigDecimal(columns[4]),
                    parseBigDecimal(columns[5]),
                    columns[6].trim(),
                    parseBigDecimal(columns[7]),
                    parseBigDecimal(columns[8]),
                    parseInteger(columns[9]),
                    parseBigDecimal(columns[10]),
                    columns[11].trim()
            );
        } catch (NumberFormatException ex) {
            log.debug("Skipping dataset row {} due to numeric parse issue", lineNumber, ex);
            return null;
        }
    }

    private BigDecimal parseBigDecimal(String value) {
        return new BigDecimal(value.trim());
    }

    private Integer parseInteger(String value) {
        return Integer.parseInt(value.trim());
    }

    private double calculateDistance(BehaviorRow row, BehaviorProfile profile) {
        double score = 0.0;
        score += categoricalDistance(row.dayType(), profile.dayType(), 0.9);
        score += categoricalDistance(normalizeTransport(row.transportMode()), normalizeTransport(profile.transportMode()), 1.8);
        score += categoricalDistance(normalizeFood(row.foodType()), normalizeFood(profile.foodType()), 1.1);

        score += numericDistance(row.distanceKm(), profile.distanceKm(), numericRanges.distanceRange(), 1.4);
        score += numericDistance(row.electricityKwh(), profile.electricityKwh(), numericRanges.electricityRange(), 1.0);
        score += numericDistance(row.renewableUsagePct(), profile.renewableUsagePct(), numericRanges.renewableRange(), 0.7);
        score += numericDistance(row.screenTimeHours(), profile.screenTimeHours(), numericRanges.screenTimeRange(), 0.6);
        score += numericDistance(row.wasteGeneratedKg(), profile.wasteGeneratedKg(), numericRanges.wasteRange(), 1.0);
        score += numericDistance(BigDecimal.valueOf(row.ecoActions()), BigDecimal.valueOf(profile.ecoActions()), numericRanges.ecoActionsRange(), 0.8);
        return score;
    }

    private double categoricalDistance(String left, String right, double weight) {
        return normalizeToken(left).equals(normalizeToken(right)) ? 0.0 : weight;
    }

    private double numericDistance(BigDecimal left, BigDecimal right, NumericRange range, double weight) {
        if (left == null || right == null) {
            return weight * 0.5;
        }
        double denominator = range.max() - range.min();
        if (denominator <= 0) {
            return 0.0;
        }
        double difference = Math.abs(left.doubleValue() - right.doubleValue()) / denominator;
        return Math.min(2.0, difference) * weight;
    }

    private BigDecimal sanitizeBlendWeight(BigDecimal configuredWeight) {
        if (configuredWeight == null) {
            return DEFAULT_BLEND_WEIGHT;
        }
        return configuredWeight.max(BigDecimal.ZERO).min(BigDecimal.ONE);
    }

    private String normalizeTransport(String value) {
        String normalized = normalizeToken(value);
        if ("TRAIN".equals(normalized) || "METRO".equals(normalized) || "AUTO".equals(normalized)) {
            return "BUS";
        }
        return normalized;
    }

    private String normalizeFood(String value) {
        return normalizeToken(value).replace("_", "-");
    }

    private String normalizeToken(String value) {
        return value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
    }

    private String formatToken(String token) {
        String lower = token == null ? "" : token.toLowerCase(Locale.ROOT);
        if (lower.isBlank()) {
            return "Medium";
        }
        if (lower.contains("-")) {
            String[] parts = lower.split("-");
            List<String> formatted = new ArrayList<>();
            for (String part : parts) {
                formatted.add(capitalize(part));
            }
            return String.join("-", formatted);
        }
        return capitalize(lower);
    }

    private String capitalize(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        return Character.toUpperCase(value.charAt(0)) + value.substring(1);
    }

    private String classifyImpact(BigDecimal emission) {
        if (emission == null) {
            return "Medium";
        }
        if (emission.compareTo(new BigDecimal("6.00")) <= 0) {
            return "Low";
        }
        if (emission.compareTo(new BigDecimal("10.00")) <= 0) {
            return "Medium";
        }
        return "High";
    }

    public record BehaviorProfile(
            String dayType,
            String transportMode,
            BigDecimal distanceKm,
            BigDecimal electricityKwh,
            BigDecimal renewableUsagePct,
            String foodType,
            BigDecimal screenTimeHours,
            BigDecimal wasteGeneratedKg,
            Integer ecoActions
    ) {}

    public record BehaviorPrediction(
            BigDecimal predictedFootprint,
            String impactLevel,
            boolean datasetConnected,
            int matchedSamples
    ) {}

        public record DatasetTip(
            String id,
            String icon,
            String bg,
            String title,
            String description,
            String savings
        ) {}

        public record DatasetInsights(
            boolean datasetConnected,
            int datasetRecords,
            BigDecimal averageFootprint,
            BigDecimal lowImpactAverageFootprint,
            BigDecimal predictedFootprint,
            String impactLevel,
            int matchedSamples,
            List<DatasetTip> tips
        ) {}

    private record BehaviorRow(
            String dayType,
            String transportMode,
            BigDecimal distanceKm,
            BigDecimal electricityKwh,
            BigDecimal renewableUsagePct,
            String foodType,
            BigDecimal screenTimeHours,
            BigDecimal wasteGeneratedKg,
            Integer ecoActions,
            BigDecimal carbonFootprintKg,
            String impactLevel
    ) {}

    private record ScoredRow(BehaviorRow row, double distance) {}

    private record NumericRange(double min, double max) {
        private static NumericRange empty() {
            return new NumericRange(0.0, 0.0);
        }
    }

    private record NumericRanges(
            NumericRange distanceRange,
            NumericRange electricityRange,
            NumericRange renewableRange,
            NumericRange screenTimeRange,
            NumericRange wasteRange,
            NumericRange ecoActionsRange
    ) {
        private static NumericRanges empty() {
            NumericRange emptyRange = NumericRange.empty();
            return new NumericRanges(emptyRange, emptyRange, emptyRange, emptyRange, emptyRange, emptyRange);
        }

        private static NumericRanges fromRows(List<BehaviorRow> rows) {
            return new NumericRanges(
                    range(rows, BehaviorRow::distanceKm),
                    range(rows, BehaviorRow::electricityKwh),
                    range(rows, BehaviorRow::renewableUsagePct),
                    range(rows, BehaviorRow::screenTimeHours),
                    range(rows, BehaviorRow::wasteGeneratedKg),
                    range(rows, row -> BigDecimal.valueOf(row.ecoActions()))
            );
        }

        private static NumericRange range(List<BehaviorRow> rows, Function<BehaviorRow, BigDecimal> selector) {
            double min = Double.POSITIVE_INFINITY;
            double max = Double.NEGATIVE_INFINITY;
            for (BehaviorRow row : rows) {
                BigDecimal value = selector.apply(row);
                if (value == null) {
                    continue;
                }
                double current = value.doubleValue();
                min = Math.min(min, current);
                max = Math.max(max, current);
            }
            if (Double.isInfinite(min) || Double.isInfinite(max)) {
                return NumericRange.empty();
            }
            return new NumericRange(min, max);
        }
    }
}