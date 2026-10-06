package com.app.features.learning.calculator;

import com.app.features.learning.dto.record.CupStats;
import com.app.features.learning.dto.record.LearningStatsData;
import com.app.features.model.UserEntity;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class CupStatsCalculator {


    public CupStats calculate(UserEntity user, LearningStatsData data) {
        int totalCups = (int) data.totalQuizQuestionPoints();
        int earnedCups = (int) Math.min(totalCups, Math.max(0, data.earnedQuizQuestionPoints()));

        log.debug("Cup statistics calculated, userId={}, earnedCups={}, totalCups={}", user.getId(), earnedCups, totalCups);
        return new CupStats(earnedCups, totalCups);
    }

}
