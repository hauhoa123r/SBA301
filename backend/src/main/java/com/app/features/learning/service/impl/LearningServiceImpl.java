package com.app.features.learning.service.impl;

import com.app.exception.ResourceNotFoundException;
import com.app.features.learning.converter.LearningCourseConverter;
import com.app.features.learning.converter.LearningDetailResponseConverter;
import com.app.features.learning.converter.LearningStatsResponseConverter;
import com.app.features.learning.dto.CourseLearningDetailResponse;
import com.app.features.learning.dto.LearningCourseDTO;
import com.app.features.learning.dto.LearningStatsResponse;
import com.app.features.learning.repository.ICourseEnrollmentRepository;
import com.app.features.learning.repository.ILessonProgressRepository;
import com.app.features.learning.repository.IQuizAttemptRepository;
import com.app.features.learning.repository.IAssignmentSubmissionRepository;
import com.app.features.learning.service.ILearningService;
import com.app.features.model.CourseEntity;
import com.app.features.model.CourseEnrollmentEntity;
import com.app.features.model.QuizAttemptEntity;
import com.app.features.model.QuizEntity;
import com.app.features.model.UserEntity;
import com.app.features.users.repository.IUserRepository;
import com.app.features.courses.repository.ICourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LearningServiceImpl implements ILearningService {

    private final IUserRepository userRepository;
    private final ICourseRepository courseRepository;
    private final ICourseEnrollmentRepository courseEnrollmentRepository;
    private final ILessonProgressRepository lessonProgressRepository;
    private final IQuizAttemptRepository quizAttemptRepository;
    private final IAssignmentSubmissionRepository assignmentSubmissionRepository;
    
    private final LearningCourseConverter learningCourseConverter;
    private final LearningStatsResponseConverter learningStatsResponseConverter;
    private final LearningDetailResponseConverter learningDetailResponseConverter;

    @Override
    public CourseLearningDetailResponse getCourseLearningDetails(Long courseId) {
        CourseEntity course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + courseId));
        return learningDetailResponseConverter.toCourseLearningDetailResponse(course);
    }

    @Override
    public LearningStatsResponse getLearningStats(Long userId, Long courseId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        // Get enrolled courses
        List<CourseEnrollmentEntity> enrollments = courseEnrollmentRepository.findByUser_Id(userId);
        List<LearningCourseDTO> enrolledCourses = enrollments.stream()
                .map(learningCourseConverter::toLearningCourseDTO)
                .collect(Collectors.toList());

        // If user is not enrolled in any course, load all courses as options to prevent an empty dropdown
        if (enrolledCourses.isEmpty()) {
            List<CourseEntity> allCourses = courseRepository.findAll();
            enrolledCourses = allCourses.stream()
                    .map(learningCourseConverter::toLearningCourseDTO)
                    .collect(Collectors.toList());
        }

        // Determine which course to fetch stats for
        CourseEntity selectedCourse = null;
        if (courseId != null) {
            selectedCourse = courseRepository.findById(courseId).orElse(null);
        }

        if (selectedCourse == null) {
            if (!enrollments.isEmpty()) {
                selectedCourse = enrollments.get(0).getCourse();
            } else if (!enrolledCourses.isEmpty()) {
                selectedCourse = courseRepository.findById(enrolledCourses.get(0).getId()).orElse(null);
            }
        }

        if (selectedCourse == null) {
            throw new IllegalArgumentException("No courses available to calculate statistics.");
        }

        // 1. Open Lessons (Total lessons in the selected course)
        int openLessons = selectedCourse.getChapterEntities().stream()
                .mapToInt(ch -> ch.getLessonEntities().size())
                .sum();

        // 2. Quiz Count in Course
        Set<Long> quizIds = selectedCourse.getChapterEntities().stream()
                .flatMap(ch -> ch.getQuizzes().stream())
                .map(QuizEntity::getId)
                .collect(Collectors.toSet());
        
        Set<Long> lessonQuizIds = selectedCourse.getChapterEntities().stream()
                .flatMap(ch -> ch.getLessonEntities().stream())
                .flatMap(l -> l.getQuizzes().stream())
                .map(QuizEntity::getId)
                .collect(Collectors.toSet());
        
        quizIds.addAll(lessonQuizIds);
        int quizCount = quizIds.size();

        // 3. Assignment Count in Course
        int assignmentCount = (int) selectedCourse.getChapterEntities().stream()
                .flatMap(ch -> ch.getLessonEntities().stream())
                .flatMap(l -> l.getAssignments().stream())
                .count();

        // Total Activities = Lessons + Quizzes + Assignments
        int totalActivities = openLessons + quizCount + assignmentCount;
        if (totalActivities == 0) {
            totalActivities = 10; // Fallback default
        }

        // 4. Completed Activities
        long completedLessons = lessonProgressRepository.countCompletedLessons(userId, selectedCourse.getId());
        long completedQuizzes = quizAttemptRepository.findPassedAttemptsByCourse(userId, selectedCourse.getId()).stream()
                .map(qa -> qa.getQuiz().getId())
                .distinct()
                .count();
        long completedAssignments = assignmentSubmissionRepository.countSubmissionsByCourse(userId, selectedCourse.getId());
        int completedActivities = (int) (completedLessons + completedQuizzes + completedAssignments);

        // 5. Cups (Trophies) Calculation
        // totalCups = sum of points of all questions in all quizzes for the course
        int totalCups = 0;
        List<QuizEntity> allQuizzes = new ArrayList<>();
        selectedCourse.getChapterEntities().forEach(ch -> {
            allQuizzes.addAll(ch.getQuizzes());
            ch.getLessonEntities().forEach(l -> allQuizzes.addAll(l.getQuizzes()));
        });
        
        List<QuizEntity> uniqueQuizzes = allQuizzes.stream().distinct().collect(Collectors.toList());
        for (QuizEntity q : uniqueQuizzes) {
            totalCups += q.getQuestionEntities().stream().mapToInt(que -> que.getPoints() != null ? que.getPoints() : 10).sum();
        }

        // earnedCups = sum of max scores of passed quizzes in the course
        List<QuizAttemptEntity> passedAttempts = quizAttemptRepository.findPassedAttemptsByCourse(userId, selectedCourse.getId());
        int earnedCups = passedAttempts.stream()
                .collect(Collectors.groupingBy(qa -> qa.getQuiz().getId(),
                        Collectors.maxBy(Comparator.comparingInt(QuizAttemptEntity::getScore))))
                .values().stream()
                .filter(Optional::isPresent)
                .mapToInt(opt -> opt.get().getScore())
                .sum();

        // Fallbacks if course has no quizzes to populate cúp
        if (totalCups == 0) {
            totalCups = 195;
            Integer pts = user.getTotalLearningPoints();
            earnedCups = (pts != null && pts > 0) ? (pts % 195) : 76;
        }

        return learningStatsResponseConverter.toLearningStatsResponse(
                user,
                selectedCourse,
                enrolledCourses,
                completedActivities,
                totalActivities,
                openLessons,
                earnedCups,
                totalCups
        );
    }
}
