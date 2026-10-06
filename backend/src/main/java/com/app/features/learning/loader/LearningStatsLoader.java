package com.app.features.learning.loader;

import com.app.features.learning.dto.record.LearningStatsData;
import com.app.features.learning.repository.ILearningStatsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class LearningStatsLoader {

    private final ILearningStatsRepository learningStatsRepository;

    public LearningStatsData load(Long userId, Long courseId) {
        log.debug("Loading learning statistics data, userId={}, courseId={}", userId, courseId);
        long lessonCount = learningStatsRepository.countLessons(courseId);
        long quizCount = learningStatsRepository.countQuizzes(courseId);
        long assignmentCount = learningStatsRepository.countAssignments(courseId);
        long completedLessonCount = learningStatsRepository.countCompletedLessons(userId, courseId);
        long assignmentSubmissionCount = learningStatsRepository.countAssignmentSubmissions(userId, courseId);
        List<Integer> highestPassedQuizScores = learningStatsRepository.findHighestPassedQuizScores(userId, courseId);
        long totalQuizQuestionPoints = learningStatsRepository.sumQuizQuestionPoints(courseId);

        log.debug("Learning statistics data loaded, userId={}, courseId={}, lessonCount={}, quizCount={}, assignmentCount={}, completedLessonCount={}", userId, courseId, lessonCount, quizCount, assignmentCount, completedLessonCount);
        return new LearningStatsData(lessonCount, quizCount, assignmentCount, completedLessonCount, assignmentSubmissionCount,
            highestPassedQuizScores, totalQuizQuestionPoints, learningStatsRepository.sumEarnedQuizQuestionPoints(userId, courseId));
    }
}
