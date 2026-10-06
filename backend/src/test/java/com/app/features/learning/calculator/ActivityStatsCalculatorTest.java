package com.app.features.learning.calculator;

import com.app.features.learning.dto.record.ActivityStats;
import com.app.features.learning.dto.record.LearningStatsData;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ActivityStatsCalculatorTest {

    private final ActivityStatsCalculator calculator = new ActivityStatsCalculator();

    @Test
    void calculateUsesRecordedActivityCountsWhenActivitiesExist() {
        LearningStatsData data = new LearningStatsData(3, 2, 1, 2, 1, List.of(80, 65), 100);

        ActivityStats result = calculator.calculate(data);

        assertEquals(new ActivityStats(5, 6, 3), result);
    }

    @Test
    void calculateReturnsZeroWhenNoActivitiesExist() {
        LearningStatsData data = new LearningStatsData(0, 0, 0, 0, 0, List.of(), 0);

        ActivityStats result = calculator.calculate(data);

        assertEquals(new ActivityStats(0, 0, 0), result);
    }
}
