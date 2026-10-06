package com.app.features.learning.service.impl;

import com.app.exception.ResourceNotFoundException;
import com.app.features.learning.converter.LearningProgressResponseConverter;
import com.app.features.learning.dto.request.UpdateLessonProgressRequest;
import com.app.features.learning.dto.response.CourseProgressResponse;
import com.app.features.learning.repository.ICourseEnrollmentRepository;
import com.app.features.learning.repository.ILessonProgressRepository;
import com.app.features.learning.repository.ILessonRepository;
import com.app.features.learning.repository.IUserChapterProgressRepository;
import com.app.features.learning.service.ILearningProgressService;
import com.app.features.learning.service.CourseAccessService;
import com.app.features.learning.repository.IActivityCompletionRepository;
import com.app.features.learning.repository.ILearningActivityDailyRepository;
import com.app.features.learning.loader.LearningProgressDetailsLoader;
import com.app.features.model.CourseEnrollmentEntity;
import com.app.features.model.LessonEntity;
import com.app.features.model.LessonProgressEntity;
import com.app.features.model.UserChapterProgressEntity;
import com.app.features.model.UserEntity;
import com.app.features.users.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class LearningProgressServiceImpl implements ILearningProgressService {

    private final ICourseEnrollmentRepository courseEnrollmentRepository;
    private final ILessonRepository lessonRepository;
    private final ILessonProgressRepository lessonProgressRepository;
    private final IUserChapterProgressRepository chapterProgressRepository;
    private final IUserRepository userRepository;
    private final LearningProgressResponseConverter responseConverter;
    private final CourseAccessService courseAccessService;
    private final IActivityCompletionRepository activityCompletionRepository;
    private final ILearningActivityDailyRepository dailyRepository;
    private final LearningProgressDetailsLoader detailsLoader;

    @Override
    @Transactional(readOnly = true)
    public CourseProgressResponse getCourseProgress(Long userId, Long courseId) {
        courseAccessService.requireAccess(userId, courseId);
        boolean completed = isComplete(activityCompletionRepository.countActivities(userId, courseId, null));
        return buildResponse(userId, courseId, completed);
    }

    @Override
    @Transactional
    public CourseProgressResponse updateLessonProgress(Long userId, Long courseId, Long lessonId,
                                                       UpdateLessonProgressRequest request) {
        CourseEnrollmentEntity enrollment = courseAccessService.ensureProgressEnrollment(userId, courseId);
        LessonEntity lesson = lessonRepository.findByIdAndChapter_CourseEntity_Id(lessonId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found in this course: " + lessonId));
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        LessonProgressEntity lessonProgress = lessonProgressRepository.findByUser_IdAndLesson_Id(userId, lessonId)
                .orElseGet(() -> newLessonProgress(user, lesson));
        lessonProgress.setIsCompleted(request.completed());
        lessonProgress.setUpdatedAt(Instant.now());
        lessonProgressRepository.save(lessonProgress);
        dailyRepository.record(userId, java.time.LocalDate.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh")), 0, 1);

        boolean chapterCompleted = synchronizeChapterProgress(user, lesson);
        boolean courseCompleted = synchronizeCourseProgress(userId, courseId, enrollment);
        log.info("Learning progress updated, userId={}, courseId={}, lessonId={}, lessonCompleted={}, chapterCompleted={}, courseCompleted={}",
                userId, courseId, lessonId, request.completed(), chapterCompleted, courseCompleted);

        return buildResponse(userId, courseId, courseCompleted);
    }

    private LessonProgressEntity newLessonProgress(UserEntity user, LessonEntity lesson) {
        LessonProgressEntity progress = new LessonProgressEntity();
        progress.setUser(user);
        progress.setLesson(lesson);
        progress.setWatchSeconds(0);
        progress.setIsCompleted(false);
        return progress;
    }

    private boolean synchronizeChapterProgress(UserEntity user, LessonEntity lesson) {
        Long chapterId = lesson.getChapter().getId();
        boolean completed = isComplete(activityCompletionRepository.countActivities(user.getId(),
                lesson.getChapter().getCourseEntity().getId(), chapterId));

        UserChapterProgressEntity chapterProgress = chapterProgressRepository
                .findByUserEntity_IdAndChapterEntity_Id(user.getId(), chapterId)
                .orElseGet(() -> UserChapterProgressEntity.builder()
                        .userEntity(user)
                        .chapterEntity(lesson.getChapter())
                        .build());
        boolean wasCompleted = Boolean.TRUE.equals(chapterProgress.getIsCompleted());
        chapterProgress.setIsCompleted(completed);
        if (completed && !wasCompleted) {
            chapterProgress.setCompletedAt(LocalDateTime.now());
        } else if (!completed) {
            chapterProgress.setCompletedAt(null);
        }
        chapterProgressRepository.save(chapterProgress);
        return completed;
    }

    private boolean synchronizeCourseProgress(Long userId, Long courseId, CourseEnrollmentEntity enrollment) {
        boolean completed = isComplete(activityCompletionRepository.countActivities(userId, courseId, null));
        if (completed && enrollment.getCompletedAt() == null) {
            enrollment.setCompletedAt(Instant.now());
        } else if (!completed) {
            enrollment.setCompletedAt(null);
        }
        courseEnrollmentRepository.save(enrollment);
        return completed;
    }

    private CourseProgressResponse buildResponse(Long userId, Long courseId, boolean courseCompleted) {
        CourseProgressResponse response = responseConverter.toResponse(
                courseId,
                lessonProgressRepository.findCompletedLessonIds(userId, courseId),
                chapterProgressRepository.findCompletedChapterIds(userId, courseId),
                courseCompleted
        );
        detailsLoader.enrich(response, userId, courseId);
        return response;
    }

    private boolean isComplete(IActivityCompletionRepository.Counts counts) {
        return counts.getTotal() > 0 && counts.getTotal() == counts.getCompleted();
    }

    @Transactional
    public CourseProgressResponse synchronizeActivities(Long userId, Long courseId, com.app.features.model.ChapterEntity chapter) {
        CourseEnrollmentEntity enrollment = courseAccessService.ensureProgressEnrollment(userId, courseId);
        UserEntity user = userRepository.findById(userId).orElseThrow();
        // Reuse chapter synchronization for both lesson and chapter activities, including empty chapters.
        LessonEntity chapterLesson = new LessonEntity();
        chapterLesson.setChapter(chapter);
        synchronizeChapterProgress(user, chapterLesson);
        return buildResponse(userId, courseId, synchronizeCourseProgress(userId, courseId, enrollment));
    }

    @Transactional
    public void recalculateRecordedActivities(Long userId, Long courseId, com.app.features.model.ChapterEntity chapter) {
        // Used after an authorized reviewer grades a submission, even if student access has expired.
        courseEnrollmentRepository.findByUser_IdAndCourse_Id(userId, courseId).ifPresent(enrollment -> {
            LessonEntity chapterLesson = new LessonEntity(); chapterLesson.setChapter(chapter);
            synchronizeChapterProgress(enrollment.getUser(), chapterLesson);
            synchronizeCourseProgress(userId, courseId, enrollment);
        });
    }
}
