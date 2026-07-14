package com.app.features.learning.calculator;

import com.app.features.learning.dto.record.CupStats;
import com.app.features.learning.dto.record.LearningStatsData;
import com.app.features.model.UserEntity;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CupStatsCalculatorTest {

    private final CupStatsCalculator calculator = new CupStatsCalculator();

    @Test
    void calculateUsesQuizPointsWhenQuizQuestionsExist() {
        UserEntity user = userWithLearningPoints(999);
        LearningStatsData data = dataWithQuizPoints(List.of(30, 50, 70), 200);

        CupStats result = calculator.calculate(user, data);

        assertEquals(new CupStats(150, 200), result);
    }

    @Test
    void calculateUsesDefaultWhenLearningPointsAreNull() {
        CupStats result = calculator.calculate(userWithLearningPoints(null), dataWithQuizPoints(List.of(), 0));

        assertEquals(new CupStats(76, 195), result);
    }

    @Test
    void calculateUsesDefaultWhenLearningPointsAreZero() {
        CupStats result = calculator.calculate(userWithLearningPoints(0), dataWithQuizPoints(List.of(), 0));

        assertEquals(new CupStats(76, 195), result);
    }

    @Test
    void calculateUsesDefaultWhenLearningPointsAreNegative() {
        CupStats result = calculator.calculate(userWithLearningPoints(-25), dataWithQuizPoints(List.of(), 0));

        assertEquals(new CupStats(76, 195), result);
    }

    @Test
    void calculateUsesRemainderForPositiveLearningPoints() {
        CupStats result = calculator.calculate(userWithLearningPoints(250), dataWithQuizPoints(List.of(), 0));

        assertEquals(new CupStats(55, 195), result);
    }

    @Test
    void calculateReturnsZeroForPositiveExactMultipleOfDefaultTotal() {
        CupStats result = calculator.calculate(userWithLearningPoints(390), dataWithQuizPoints(List.of(), 0));

        assertEquals(new CupStats(0, 195), result);
    }

    private UserEntity userWithLearningPoints(Integer learningPoints) {
        UserEntity user = new UserEntity();
        user.setTotalLearningPoints(learningPoints);
        return user;
    }

    private LearningStatsData dataWithQuizPoints(List<Integer> scores, long totalQuizQuestionPoints) {
        return new LearningStatsData(0, 0, 0, 0, 0, scores, totalQuizQuestionPoints);
    }
}
