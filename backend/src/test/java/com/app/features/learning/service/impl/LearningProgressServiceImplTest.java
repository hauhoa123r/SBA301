package com.app.features.learning.service.impl;

import com.app.exception.AccessDeniedException;
import com.app.features.learning.converter.LearningProgressResponseConverter;
import com.app.features.learning.dto.request.UpdateLessonProgressRequest;
import com.app.features.learning.dto.response.CourseProgressResponse;
import com.app.features.learning.loader.LearningProgressDetailsLoader;
import com.app.features.learning.repository.*;
import com.app.features.learning.service.CourseAccessService;
import com.app.features.model.*;
import com.app.features.users.repository.IUserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.time.Instant;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LearningProgressServiceImplTest {
    @Mock ICourseEnrollmentRepository courseEnrollmentRepository;
    @Mock ILessonRepository lessonRepository;
    @Mock ILessonProgressRepository lessonProgressRepository;
    @Mock IUserChapterProgressRepository chapterProgressRepository;
    @Mock IUserRepository userRepository;
    @Mock LearningProgressResponseConverter responseConverter;
    @Mock CourseAccessService courseAccessService;
    @Mock IActivityCompletionRepository activityCompletionRepository;
    @Mock ILearningActivityDailyRepository dailyRepository;
    @Mock LearningProgressDetailsLoader detailsLoader;
    @InjectMocks LearningProgressServiceImpl progressService;

    @Test void expiredAccessCannotChangeProgress() {
        when(courseAccessService.ensureProgressEnrollment(16L, 3L)).thenThrow(new AccessDeniedException("Gói đã hết hạn"));
        assertThrows(AccessDeniedException.class, () -> progressService.updateLessonProgress(16L, 3L, 20L, new UpdateLessonProgressRequest(true)));
        verifyNoInteractions(lessonRepository, lessonProgressRepository, chapterProgressRepository, dailyRepository);
    }
    @Test void remainingQuizOrAssignmentKeepsCourseIncomplete() {
        Fixture fixture = setup(3, 2);
        progressService.updateLessonProgress(16L, 3L, 20L, new UpdateLessonProgressRequest(true));
        assertTrue(fixture.lessonProgress.getIsCompleted());
        assertNull(fixture.enrollment.getCompletedAt());
        ArgumentCaptor<UserChapterProgressEntity> chapter = ArgumentCaptor.forClass(UserChapterProgressEntity.class);
        verify(chapterProgressRepository).save(chapter.capture());
        assertFalse(chapter.getValue().getIsCompleted());
    }
    @Test void lastRequiredActivityCompletesChapterAndCourse() {
        Fixture fixture = setup(3, 3);
        progressService.updateLessonProgress(16L, 3L, 20L, new UpdateLessonProgressRequest(true));
        assertNotNull(fixture.enrollment.getCompletedAt());
        ArgumentCaptor<UserChapterProgressEntity> chapter = ArgumentCaptor.forClass(UserChapterProgressEntity.class);
        verify(chapterProgressRepository).save(chapter.capture());
        assertTrue(chapter.getValue().getIsCompleted());
        assertNotNull(chapter.getValue().getCompletedAt());
    }
    @Test void markingIncompleteClearsCompletionAndPreservesVideoHistory() {
        Fixture fixture = setup(3, 2);
        fixture.enrollment.setCompletedAt(Instant.now());
        fixture.lessonProgress.setIsCompleted(true);
        fixture.lessonProgress.setWatchSeconds(45);
        fixture.lessonProgress.setPositionSeconds(30);
        progressService.updateLessonProgress(16L, 3L, 20L, new UpdateLessonProgressRequest(false));
        assertFalse(fixture.lessonProgress.getIsCompleted());
        assertEquals(45, fixture.lessonProgress.getWatchSeconds());
        assertEquals(30, fixture.lessonProgress.getPositionSeconds());
        assertNull(fixture.enrollment.getCompletedAt());
        ArgumentCaptor<UserChapterProgressEntity> chapter = ArgumentCaptor.forClass(UserChapterProgressEntity.class);
        verify(chapterProgressRepository).save(chapter.capture());
        assertFalse(chapter.getValue().getIsCompleted());
        assertNull(chapter.getValue().getCompletedAt());
    }
    @Test void readUsesActualActivitiesInsteadOfStaleEnrollmentFlag() {
        when(activityCompletionRepository.countActivities(16L, 3L, null)).thenReturn(counts(3, 2));
        when(lessonProgressRepository.findCompletedLessonIds(16L, 3L)).thenReturn(List.of(20L));
        when(chapterProgressRepository.findCompletedChapterIds(16L, 3L)).thenReturn(List.of());
        var expected = new CourseProgressResponse();
        when(responseConverter.toResponse(3L, List.of(20L), List.of(), false)).thenReturn(expected);
        assertSame(expected, progressService.getCourseProgress(16L, 3L));
        verify(courseAccessService).requireAccess(16L, 3L);
    }
    private Fixture setup(long total, long completed) {
        var user = new UserEntity(); user.setId(16L);
        var course = new CourseEntity(); course.setId(3L);
        var chapter = new ChapterEntity(); chapter.setId(7L); chapter.setCourseEntity(course);
        var lesson = new LessonEntity(); lesson.setId(20L); lesson.setChapter(chapter);
        var lp = new LessonProgressEntity(); lp.setUser(user); lp.setLesson(lesson); lp.setWatchSeconds(0);
        var enrollment = new CourseEnrollmentEntity(); enrollment.setUser(user); enrollment.setCourse(course);
        when(courseAccessService.ensureProgressEnrollment(16L, 3L)).thenReturn(enrollment);
        when(lessonRepository.findByIdAndChapter_CourseEntity_Id(20L, 3L)).thenReturn(Optional.of(lesson));
        when(userRepository.findById(16L)).thenReturn(Optional.of(user));
        when(lessonProgressRepository.findByUser_IdAndLesson_Id(16L, 20L)).thenReturn(Optional.of(lp));
        when(activityCompletionRepository.countActivities(16L, 3L, 7L)).thenReturn(counts(total, completed));
        when(activityCompletionRepository.countActivities(16L, 3L, null)).thenReturn(counts(total, completed));
        when(lessonProgressRepository.findCompletedLessonIds(16L, 3L)).thenReturn(List.of(20L));
        when(chapterProgressRepository.findCompletedChapterIds(16L, 3L)).thenReturn(List.of());
        when(responseConverter.toResponse(3L, List.of(20L), List.of(), total == completed)).thenReturn(new CourseProgressResponse());
        return new Fixture(enrollment, lp);
    }
    private IActivityCompletionRepository.Counts counts(long total, long completed) {
        return new IActivityCompletionRepository.Counts() {
            public long getTotal() { return total; }
            public long getCompleted() { return completed; }
        };
    }
    private record Fixture(CourseEnrollmentEntity enrollment, LessonProgressEntity lessonProgress) { }
}
