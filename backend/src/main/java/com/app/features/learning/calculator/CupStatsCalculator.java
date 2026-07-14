package com.app.features.learning.calculator;

import com.app.features.learning.dto.record.CupStats;
import com.app.features.learning.dto.record.LearningStatsData;
import com.app.features.model.UserEntity;
import org.springframework.stereotype.Component;

@Component
public class CupStatsCalculator {

    private static final int DEFAULT_TOTAL_CUPS = 195;
    private static final int DEFAULT_EARNED_CUPS = 76;

    public CupStats calculate(UserEntity user, LearningStatsData data) {
        int totalCups = (int) data.totalQuizQuestionPoints();
        int earnedCups = data.highestPassedQuizScores().stream().mapToInt(Integer::intValue).sum();

        if (totalCups == 0) {
            return fallbackStats(user.getTotalLearningPoints());
        }
        return new CupStats(earnedCups, totalCups);
    }

    private CupStats fallbackStats(Integer totalLearningPoints) {
        int earnedCups = totalLearningPoints != null && totalLearningPoints > 0 ? totalLearningPoints % DEFAULT_TOTAL_CUPS : DEFAULT_EARNED_CUPS;
        return new CupStats(earnedCups, DEFAULT_TOTAL_CUPS);
    }
}
