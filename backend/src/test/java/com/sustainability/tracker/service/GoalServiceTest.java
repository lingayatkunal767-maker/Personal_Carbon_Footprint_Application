package com.sustainability.tracker.service;

import com.sustainability.tracker.dto.GoalRequest;
import com.sustainability.tracker.dto.GoalResponse;
import com.sustainability.tracker.entity.CarbonLog;
import com.sustainability.tracker.entity.Goal;
import com.sustainability.tracker.entity.User;
import com.sustainability.tracker.repository.CarbonLogRepository;
import com.sustainability.tracker.repository.GoalRepository;
import com.sustainability.tracker.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GoalServiceTest {

    @Mock
    private GoalRepository goalRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CarbonLogRepository carbonLogRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private BadgeEarningService badgeEarningService;

    @InjectMocks
    private GoalService goalService;

    @Test
    @SuppressWarnings("null")
    void createGoalNormalizesStatusAndGoalTypeAndAppliesNumericDefaults() {
        GoalRequest request = new GoalRequest();
        request.setUserId(1L);
        request.setGoalType("  Reduce_Total  ");
        request.setStatus("  AcTiVe  ");

        User user = new User();
        user.setId(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(goalRepository.save(any(Goal.class))).thenAnswer(invocation -> {
            Goal saved = invocation.getArgument(0, Goal.class);
            saved.setId(101L);
            return saved;
        });

        GoalResponse response = goalService.createGoal(request);

        assertNotNull(response);
        assertEquals("reduce_total", response.getGoalType());
        assertEquals("active", response.getStatus());
        assertEquals(new BigDecimal("100"), response.getTargetValue());
        assertEquals(BigDecimal.ZERO, response.getCurrentValue());

        ArgumentCaptor<Goal> savedGoalCaptor = ArgumentCaptor.forClass(Goal.class);
        verify(goalRepository, times(1)).save(savedGoalCaptor.capture());
        Goal savedGoal = savedGoalCaptor.getValue();
        assertEquals("reduce_total", savedGoal.getGoalType());
        assertEquals("active", savedGoal.getStatus());
    }

    @Test
    @SuppressWarnings("null")
    void updateGoalNormalizesStatusAndTriggersProgressNotificationAtMilestone() {
        User user = new User();
        user.setId(7L);

        Goal existing = new Goal();
        existing.setId(55L);
        existing.setUser(user);
        existing.setGoalType("reduce_total");
        existing.setTargetValue(new BigDecimal("100"));
        existing.setCurrentValue(BigDecimal.ZERO);
        existing.setStatus("active");
        existing.setCreatedAt(LocalDateTime.now());

        GoalRequest request = new GoalRequest();
        request.setStatus("  AcTiVe  ");
        request.setCurrentValue(new BigDecimal("50"));

        when(goalRepository.findById(55L)).thenReturn(Optional.of(existing));
        when(goalRepository.save(any(Goal.class))).thenAnswer(invocation -> invocation.getArgument(0, Goal.class));

        GoalResponse response = goalService.updateGoal(55L, request);

        assertNotNull(response);
        assertEquals("active", response.getStatus());
        assertEquals(new BigDecimal("50"), response.getCurrentValue());

        verify(notificationService, times(1))
                .notifyGoalProgress(7L, "reduce_total", 50, 55L);
        verify(notificationService, never())
                .notifyGoalCompleted(any(), any(), any());
        verify(badgeEarningService, never()).checkAndAwardBadges(any());
    }

    @Test
    void updateGoalProgressReturnsEarlyWhenUserIdIsNull() {
        assertDoesNotThrow(() -> goalService.updateGoalProgress(null));

        verify(goalRepository, never()).findByUserIdOrderByCreatedAtDesc(any());
        verify(goalRepository, never()).save(any());
        verify(carbonLogRepository, never())
                .findByUserIdAndLogDateBetweenOrderByLogDate(any(), any(), any());
    }

    @Test
    @SuppressWarnings("null")
    void updateGoalProgressSkipsGoalWhenUserReferenceIsMissing() {
        Goal malformedGoal = new Goal();
        malformedGoal.setId(999L);
        malformedGoal.setStatus("active");
        malformedGoal.setGoalType("reduce_total");

        when(goalRepository.findByUserIdOrderByCreatedAtDesc(3L)).thenReturn(List.of(malformedGoal));

        assertDoesNotThrow(() -> goalService.updateGoalProgress(3L));

        verify(carbonLogRepository, never())
                .findByUserIdAndLogDateBetweenOrderByLogDate(any(), any(), any());
        verify(goalRepository, never()).save(any());
    }

    @Test
    @SuppressWarnings("null")
    void updateGoalProgressHandlesNullCreatedAtAndGoalTypeWithoutCrash() {
        User user = new User();
        user.setId(11L);

        Goal goal = new Goal();
        goal.setId(1001L);
        goal.setUser(user);
        goal.setStatus("active");
        goal.setGoalType(null);
        goal.setTargetValue(new BigDecimal("10"));
        goal.setCurrentValue(BigDecimal.ZERO);
        goal.setCreatedAt(null);

        CarbonLog log = new CarbonLog();
        log.setUserId(11L);
        log.setLogDate(LocalDate.now());
        log.setTotalEmission(new BigDecimal("8.50"));

        when(goalRepository.findByUserIdOrderByCreatedAtDesc(11L)).thenReturn(List.of(goal));
        when(carbonLogRepository.findByUserIdAndLogDateBetweenOrderByLogDate(any(), any(), any()))
                .thenReturn(List.of(log));
        when(goalRepository.save(any(Goal.class))).thenAnswer(invocation -> invocation.getArgument(0, Goal.class));

        assertDoesNotThrow(() -> goalService.updateGoalProgress(11L));

        verify(goalRepository, times(1)).save(any(Goal.class));
    }
}
