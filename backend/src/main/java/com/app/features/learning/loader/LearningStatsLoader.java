package com.app.features.learning.loader;

import com.app.features.learning.dto.record.LearningStatsData;
import com.app.features.learning.repository.ILearningStatsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class LearningStatsLoader {

    private final ILearningStatsRepository learningStatsRepository;

    public LearningStatsData load(Long userId, Long courseId) {
        long lessonCount = learningStatsRepository.countLessons(courseId);
        long quizCount = learningStatsRepository.countQuizzes(courseId);
        long assignmentCount = learningStatsRepository.countAssignments(courseId);
        long completedLessonCount = learningStatsRepository.countCompletedLessons(userId, courseId);
        long assignmentSubmissionCount = learningStatsRepository.countAssignmentSubmissions(userId, courseId);
        List<Integer> highestPassedQuizScores = learningStatsRepository.findHighestPassedQuizScores(userId, courseId);
        long totalQuizQuestionPoints = learningStatsRepository.sumQuizQuestionPoints(courseId);

        return new LearningStatsData(lessonCount, quizCount, assignmentCount, completedLessonCount, assignmentSubmissionCount, highestPassedQuizScores, totalQuizQuestionPoints);
    }
}
