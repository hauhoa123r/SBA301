package com.app.features.learning.service.model;

import java.util.List;

public record LearningStatsData(long lessonCount, long quizCount, long assignmentCount, long completedLessonCount, long assignmentSubmissionCount, List<Integer> highestPassedQuizScores, long totalQuizQuestionPoints) {
}
