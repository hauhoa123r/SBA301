package com.app.features.learning.calculator;

import com.app.features.learning.dto.record.ActivityStats;
import com.app.features.learning.dto.record.CupStats;
import com.app.features.learning.dto.record.LearningStats;
import com.app.features.learning.dto.record.LearningStatsData;
import com.app.features.model.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class LearningStatsCalculator {

    private final ActivityStatsCalculator activityStatsCalculator;
    private final CupStatsCalculator cupStatsCalculator;

    public LearningStats calculate(UserEntity user, LearningStatsData data) {
        ActivityStats activityStats = activityStatsCalculator.calculate(data);
        CupStats cupStats = cupStatsCalculator.calculate(user, data);
        return new LearningStats(activityStats, cupStats);
    }
}
