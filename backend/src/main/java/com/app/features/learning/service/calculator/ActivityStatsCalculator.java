package com.app.features.learning.service.calculator;

import com.app.features.learning.service.model.ActivityStats;
import com.app.features.learning.service.model.LearningStatsData;
import org.springframework.stereotype.Component;

@Component
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

        return new ActivityStats(completedActivities, applyTotalFallback(totalActivities), openLessons);
    }

    private int applyTotalFallback(int totalActivities) {
        return totalActivities == 0 ? DEFAULT_TOTAL_ACTIVITIES : totalActivities;
    }
}
