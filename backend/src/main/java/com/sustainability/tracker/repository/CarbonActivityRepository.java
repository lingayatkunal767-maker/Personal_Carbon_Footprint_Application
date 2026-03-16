package com.sustainability.tracker.repository;

import com.sustainability.tracker.entity.CarbonActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CarbonActivityRepository extends JpaRepository<CarbonActivity, Long> {

    List<CarbonActivity> findByUserIdOrderByActivityDateDesc(Long userId);

    List<CarbonActivity> findByUserIdAndActivityDateBetweenOrderByActivityDateDesc(
            Long userId, LocalDate start, LocalDate end);

    Optional<CarbonActivity> findByUserIdAndActivityTypeAndActivityDate(Long userId, String activityType, LocalDate activityDate);

    @Query("SELECT SUM(a.carbonAmount) FROM CarbonActivity a WHERE a.user.id = :userId")
    BigDecimal sumCarbonByUserId(@Param("userId") Long userId);

    @Query("SELECT SUM(a.carbonAmount) FROM CarbonActivity a " +
           "WHERE a.user.id = :userId AND a.activityDate >= :startDate")
    BigDecimal sumCarbonByUserIdAndDateAfter(@Param("userId") Long userId,
                                             @Param("startDate") LocalDate startDate);

    // Positive emissions only (last 7 days)
    @Query("SELECT SUM(a.carbonAmount) FROM CarbonActivity a " +
           "WHERE a.user.id = :userId AND a.activityDate >= :startDate AND a.carbonAmount > 0")
    BigDecimal sumPositiveCarbonByUserIdAndDateAfter(@Param("userId") Long userId,
                                                     @Param("startDate") LocalDate startDate);

    // Total offset (sum of absolute negatives)
    @Query("SELECT SUM(ABS(a.carbonAmount)) FROM CarbonActivity a " +
           "WHERE a.user.id = :userId AND a.carbonAmount < 0")
    BigDecimal sumOffsetByUserId(@Param("userId") Long userId);

    // Count of distinct activity days in last N days
    @Query("SELECT COUNT(DISTINCT a.activityDate) FROM CarbonActivity a " +
           "WHERE a.user.id = :userId AND a.activityDate >= :startDate")
    Long countDistinctDaysByUserIdAndDateAfter(@Param("userId") Long userId,
                                               @Param("startDate") LocalDate startDate);

    @Query("SELECT COUNT(a) FROM CarbonActivity a WHERE a.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);

    // Monthly totals — grouped by year/month in a dialect-portable way
    @Query("SELECT YEAR(a.activityDate), MONTH(a.activityDate), SUM(a.carbonAmount) " +
           "FROM CarbonActivity a " +
           "WHERE a.user.id = :userId AND a.activityDate >= :startDate " +
           "GROUP BY YEAR(a.activityDate), MONTH(a.activityDate) " +
           "ORDER BY YEAR(a.activityDate), MONTH(a.activityDate)")
    List<Object[]> monthlyTotals(@Param("userId") Long userId, @Param("startDate") LocalDate startDate);

    // Breakdown by activity type
    @Query("SELECT a.activityType, SUM(a.carbonAmount) FROM CarbonActivity a " +
           "WHERE a.user.id = :userId GROUP BY a.activityType")
    List<Object[]> breakdownByType(@Param("userId") Long userId);
}
