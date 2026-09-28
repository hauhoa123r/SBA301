package com.app.features.learning.service.impl;

import com.app.exception.AccessDeniedException;
import com.app.features.learning.converter.LearningProgressResponseConverter;
import com.app.features.learning.dto.request.UpdateLessonProgressRequest;
import com.app.features.learning.dto.response.CourseProgressResponse;
import com.app.features.learning.repository.ICourseEnrollmentRepository;
import com.app.features.learning.service.CourseAccessService;
import com.app.features.learning.repository.ILessonProgressRepository;
import com.app.features.learning.repository.ILessonRepository;
import com.app.features.learning.repository.IUserChapterProgressRepository;
import com.app.features.model.ChapterEntity;
import com.app.features.model.CourseEnrollmentEntity;
import com.app.features.model.LessonEntity;
import com.app.features.model.LessonProgressEntity;
import com.app.features.model.UserChapterProgressEntity;
import com.app.features.model.UserEntity;
import com.app.features.users.repository.IUserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LearningProgressServiceImplTest {

    @Mock
    private ICourseEnrollmentRepository courseEnrollmentRepository;
    @Mock
    private ILessonRepository lessonRepository;
    @Mock
    private ILessonProgressRepository lessonProgressRepository;
    @Mock
    private IUserChapterProgressRepository chapterProgressRepository;
    @Mock
    private IUserRepository userRepository;
    @Mock
    private LearningProgressResponseConverter responseConverter;
    @Mock
    private CourseAccessService courseAccessService;

    @InjectMocks
    private LearningProgressServiceImpl progressService;

    @Test
    void updateRejectsUserWithoutCourseEnrollment() {
        when(courseAccessService.ensureProgressEnrollment(16L, 3L)).thenThrow(new AccessDeniedException("Gói đã hết hạn"));

        assertThrows(AccessDeniedException.class, () -> progressService.updateLessonProgress(
                16L, 3L, 20L, new UpdateLessonProgressRequest(true)));

        verifyNoInteractions(lessonRepository, lessonProgressRepository, chapterProgressRepository, userRepository);
    }

    @Test
    void updateKeepsChapterAndCourseIncompleteWhenLessonsRemain() {
        ProgressFixture fixture = fixture();
        CourseProgressResponse expected = new CourseProgressResponse();
        stubUpdate(fixture, 3, 1, 5, 1, List.of(20L), List.of(), expected);

        CourseProgressResponse actual = progressService.updateLessonProgress(
                16L, 3L, 20L, new UpdateLessonProgressRequest(true));

        assertSame(expected, actual);
        ArgumentCaptor<UserChapterProgressEntity> chapterCaptor = ArgumentCaptor.forClass(UserChapterProgressEntity.class);
        verify(chapterProgressRepository).save(chapterCaptor.capture());
        assertFalse(chapterCaptor.getValue().getIsCompleted());
        assertFalse(fixture.enrollment().getCompletedAt() != null);
    }

    @Test
    void finalLessonCompletesChapterAndCourse() {
        ProgressFixture fixture = fixture();
        CourseProgressResponse expected = new CourseProgressResponse();
        stubUpdate(fixture, 2, 2, 2, 2, List.of(19L, 20L), List.of(7L), expected);

        CourseProgressResponse actual = progressService.updateLessonProgress(
                16L, 3L, 20L, new UpdateLessonProgressRequest(true));

        assertSame(expected, actual);
        ArgumentCaptor<LessonProgressEntity> lessonCaptor = ArgumentCaptor.forClass(LessonProgressEntity.class);
        verify(lessonProgressRepository).save(lessonCaptor.capture());
        assertTrue(lessonCaptor.getValue().getIsCompleted());
        assertSame(fixture.user(), lessonCaptor.getValue().getUser());
        assertSame(fixture.lesson(), lessonCaptor.getValue().getLesson());

        ArgumentCaptor<UserChapterProgressEntity> chapterCaptor = ArgumentCaptor.forClass(UserChapterProgressEntity.class);
        verify(chapterProgressRepository).save(chapterCaptor.capture());
        assertTrue(chapterCaptor.getValue().getIsCompleted());
        assertNotNull(chapterCaptor.getValue().getCompletedAt());
        assertNotNull(fixture.enrollment().getCompletedAt());
    }

    private void stubUpdate(ProgressFixture fixture,
                            long chapterLessonCount,
                            long completedChapterLessonCount,
                            long courseLessonCount,
                            long completedCourseLessonCount,
                            List<Long> completedLessonIds,
                            List<Long> completedChapterIds,
                            CourseProgressResponse expected) {
        when(courseAccessService.ensureProgressEnrollment(16L, 3L)).thenReturn(fixture.enrollment());
        when(lessonRepository.findByIdAndChapter_CourseEntity_Id(20L, 3L))
                .thenReturn(Optional.of(fixture.lesson()));
        when(userRepository.findById(16L)).thenReturn(Optional.of(fixture.user()));
        when(lessonProgressRepository.findByUser_IdAndLesson_Id(16L, 20L)).thenReturn(Optional.empty());
        when(lessonRepository.countByChapter_Id(7L)).thenReturn(chapterLessonCount);
        when(lessonProgressRepository.countByUser_IdAndLesson_Chapter_IdAndIsCompletedTrue(16L, 7L))
                .thenReturn(completedChapterLessonCount);
        when(chapterProgressRepository.findByUserEntity_IdAndChapterEntity_Id(16L, 7L))
                .thenReturn(Optional.empty());
        when(lessonRepository.countByChapter_CourseEntity_Id(3L)).thenReturn(courseLessonCount);
        when(lessonProgressRepository.countByUser_IdAndLesson_Chapter_CourseEntity_IdAndIsCompletedTrue(16L, 3L))
                .thenReturn(completedCourseLessonCount);
        when(lessonProgressRepository.findCompletedLessonIds(16L, 3L)).thenReturn(completedLessonIds);
        when(chapterProgressRepository.findCompletedChapterIds(16L, 3L)).thenReturn(completedChapterIds);
        when(responseConverter.toResponse(3L, completedLessonIds, completedChapterIds,
                courseLessonCount == completedCourseLessonCount)).thenReturn(expected);
    }

    private ProgressFixture fixture() {
        UserEntity user = new UserEntity();
        user.setId(16L);
        ChapterEntity chapter = new ChapterEntity();
        chapter.setId(7L);
        LessonEntity lesson = new LessonEntity();
        lesson.setId(20L);
        lesson.setChapter(chapter);
        CourseEnrollmentEntity enrollment = new CourseEnrollmentEntity();
        enrollment.setUser(user);
        return new ProgressFixture(user, lesson, enrollment);
    }

    private record ProgressFixture(UserEntity user, LessonEntity lesson, CourseEnrollmentEntity enrollment) {
    }
}
