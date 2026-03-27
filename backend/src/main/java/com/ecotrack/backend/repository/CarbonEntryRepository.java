package com.ecotrack.backend.repository;

import com.ecotrack.backend.entity.CarbonEntry;
import com.ecotrack.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface CarbonEntryRepository extends JpaRepository<CarbonEntry, Long> {

    List<CarbonEntry> findByUserOrderByDateDescCreatedAtDesc(User user);

    @Query("SELECT SUM(e.amount) FROM CarbonEntry e WHERE e.user = :user")
    Double sumByUser(@Param("user") User user);

    @Query("SELECT SUM(e.amount) FROM CarbonEntry e WHERE e.user = :user AND e.date >= :from AND e.date <= :to")
    Double sumByUserAndDateBetween(@Param("user") User user, @Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT e.category, SUM(e.amount) FROM CarbonEntry e WHERE e.user = :user GROUP BY e.category")
    List<Object[]> sumByCategoryForUser(@Param("user") User user);

    @Query("SELECT e.date, SUM(e.amount) FROM CarbonEntry e WHERE e.user = :user AND e.date >= :from GROUP BY e.date ORDER BY e.date")
    List<Object[]> dailySumForUser(@Param("user") User user, @Param("from") LocalDate from);

    // Your Milestone 4 History Query
    List<CarbonEntry> findByUserId(Long userId);

    // Teammate's Admin analytics — global queries
    @Query("SELECT SUM(e.amount) FROM CarbonEntry e")
    Double sumAll();

    @Query("SELECT e.category, SUM(e.amount) FROM CarbonEntry e GROUP BY e.category")
    List<Object[]> sumByCategoryGlobal();

    @Query("SELECT COUNT(DISTINCT e.user) FROM CarbonEntry e")
    Long countActiveUsers();
}