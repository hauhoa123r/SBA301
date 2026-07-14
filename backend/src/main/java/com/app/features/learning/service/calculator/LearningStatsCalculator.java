package com.app.features.learning.service.calculator;

import com.app.features.learning.service.model.ActivityStats;
import com.app.features.learning.service.model.CupStats;
import com.app.features.learning.service.model.LearningStats;
import com.app.features.learning.service.model.LearningStatsData;
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
