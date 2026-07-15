package com.app.features.learning.calculator;

import com.app.features.learning.dto.record.ActivityStats;
import com.app.features.learning.dto.record.LearningStatsData;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class ActivityStatsCalculator {

    private static final int DEFAULT_TOTAL_ACTIVITIES = 10;

    public ActivityStats calculate(LearningStatsData data) {
        int openLessons = (int) data.lessonCount();
        int quizCount = (int) data.quizCount();
        int assignmentCount = (int) data.assignmentCount();
        int totalActivities = openLessons + quizCount + assignmentCount;

        long completedLessons = data.completedLessonCount();
        long completedQuizzes = data.highestPassedQuizScores().size();
        long completedAssignments = data.assignmentSubmissionCount();
        int completedActivities = (int) (completedLessons + completedQuizzes + completedAssignments);

        log.debug("Activity statistics calculated, completedActivities={}, totalActivities={}, openLessons={}", completedActivities, totalActivities, openLessons);
        return new ActivityStats(completedActivities, applyTotalFallback(totalActivities), openLessons);
    }

    private int applyTotalFallback(int totalActivities) {
        return totalActivities == 0 ? DEFAULT_TOTAL_ACTIVITIES : totalActivities;
    }
}
