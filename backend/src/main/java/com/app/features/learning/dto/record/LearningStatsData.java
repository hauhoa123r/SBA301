package com.app.features.learning.dto.record;

import java.util.List;

public record LearningStatsData(long lessonCount, long quizCount, long assignmentCount, long completedLessonCount, long assignmentSubmissionCount, List<Integer> highestPassedQuizScores, long totalQuizQuestionPoints, long earnedQuizQuestionPoints) {
    public LearningStatsData(long lessonCount, long quizCount, long assignmentCount, long completedLessonCount,
                             long assignmentSubmissionCount, List<Integer> highestPassedQuizScores, long totalQuizQuestionPoints) {
        this(lessonCount, quizCount, assignmentCount, completedLessonCount, assignmentSubmissionCount,
                highestPassedQuizScores, totalQuizQuestionPoints, 0);
    }
}
