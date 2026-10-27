package com.app.features.learning;

import com.app.features.learning.service.LearningStreakService;
import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class LearningStreakServiceTest {
    private final LocalDate today=LocalDate.of(2026,10,27);
    @Test void noActivityOrFutureOnlyDoesNotCreateAStreak() {
        assertEquals(0,LearningStreakService.calculate(List.of(),today).current());
        assertEquals(0,LearningStreakService.calculate(List.of(today.plusDays(1)),today).longest());
    }
    @Test void yesterdayKeepsTheStreakUntilTodayEndsButMissedDayResetsCurrentOnly() {
        var days=List.of(today.minusDays(3),today.minusDays(2),today.minusDays(1));
        var result=LearningStreakService.calculate(days,today);
        assertEquals(3,result.current()); assertEquals(3,result.longest()); assertFalse(result.activeToday());
        result=LearningStreakService.calculate(days,today.plusDays(1));
        assertEquals(0,result.current()); assertEquals(3,result.longest());
    }
    @Test void deduplicatesDatesAndKeepsHistoricalBestAcrossGaps() {
        var days=List.of(today.minusDays(10),today.minusDays(9),today.minusDays(8),today.minusDays(1),today,today);
        var result=LearningStreakService.calculate(days,today);
        assertEquals(2,result.current()); assertEquals(3,result.longest()); assertTrue(result.activeToday());
        assertEquals(today,result.lastActivityDate());
    }
}
