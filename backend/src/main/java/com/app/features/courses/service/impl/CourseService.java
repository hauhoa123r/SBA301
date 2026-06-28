package com.app.features.courses.service.impl;

import com.app.exception.ResourceNotFoundException;
import com.app.features.courses.dto.response.ChapterResponse;
import com.app.features.courses.dto.response.CourseResponse;
import com.app.features.courses.dto.response.LessonResponse;
import com.app.features.courses.repository.ICourseRepository;
import com.app.features.courses.service.ICourseService;
import com.app.features.model.CategoryEntity;
import com.app.features.model.ChapterEntity;
import com.app.features.model.CourseEntity;
import com.app.features.model.LessonEntity;
import com.app.features.model.PlanEntity;
import com.app.features.model.UserEntity;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CourseService implements ICourseService {
    private final ICourseRepository courseRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll()
                .stream()
                .map(this::toCourseResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CourseResponse getCourseById(Long id) {
        CourseEntity course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        return toCourseResponse(course);
    }

    private CourseResponse toCourseResponse(CourseEntity course) {
        CourseResponse response = modelMapper.map(course, CourseResponse.class);
        response.setThumbnailUrl(course.getThumbnailUrl());

        UserEntity teacher = course.getTeacher();
        if (teacher != null) {
            response.setTeacherId(teacher.getId());
            response.setInstructor(teacher.getFullName());
        }

        CategoryEntity category = course.getCategory();
        if (category != null) {
            response.setCategoryId(category.getId());
            response.setCategory(category.getName());
        }

        response.setPrice(getLowestPlanPrice(course));
        response.setStudents(course.getCourseEnrollments() == null ? 0 : course.getCourseEnrollments().size());
        response.setLevel("Tất cả trình độ");
        response.setChapters(toChapterResponses(course));
        response.setTotalLessons(countTotalLessons(response.getChapters()));
        response.setTotalDurationSeconds(countTotalDurationSeconds(response.getChapters()));
        response.setDuration(formatDuration(response.getTotalDurationSeconds()));

        return response;
    }

    private BigDecimal getLowestPlanPrice(CourseEntity course) {
        if (course.getPlans() == null || course.getPlans().isEmpty()) {
            return BigDecimal.ZERO;
        }

        return course.getPlans()
                .stream()
                .map(PlanEntity::getPrice)
                .filter(Objects::nonNull)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);
    }

    private List<ChapterResponse> toChapterResponses(CourseEntity course) {
        if (course.getChapterEntities() == null) {
            return List.of();
        }

        return course.getChapterEntities()
                .stream()
                .sorted(Comparator.comparing(ChapterEntity::getOrderIndex, Comparator.nullsLast(Integer::compareTo)))
                .map(this::toChapterResponse)
                .toList();
    }

    private ChapterResponse toChapterResponse(ChapterEntity chapter) {
        List<LessonResponse> lessons = chapter.getLessonEntities() == null
                ? List.of()
                : chapter.getLessonEntities()
                .stream()
                .sorted(Comparator.comparing(LessonEntity::getOrderIndex, Comparator.nullsLast(Integer::compareTo)))
                .map(this::toLessonResponse)
                .toList();

        return new ChapterResponse(
                chapter.getId(),
                chapter.getTitle(),
                chapter.getOrderIndex(),
                lessons
        );
    }

    private LessonResponse toLessonResponse(LessonEntity lesson) {
        Integer durationSeconds = lesson.getDurationSeconds() == null ? 0 : lesson.getDurationSeconds();
        return new LessonResponse(
                lesson.getId(),
                lesson.getTitle(),
                lesson.getVideoUrl(),
                durationSeconds,
                formatDuration(durationSeconds),
                lesson.getOrderIndex()
        );
    }

    private Integer countTotalLessons(List<ChapterResponse> chapters) {
        return chapters.stream()
                .mapToInt(chapter -> chapter.getLessons() == null ? 0 : chapter.getLessons().size())
                .sum();
    }

    private Integer countTotalDurationSeconds(List<ChapterResponse> chapters) {
        return chapters.stream()
                .flatMap(chapter -> chapter.getLessons() == null ? List.<LessonResponse>of().stream() : chapter.getLessons().stream())
                .map(LessonResponse::getDurationSeconds)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .sum();
    }

    private String formatDuration(Integer totalSeconds) {
        int seconds = totalSeconds == null ? 0 : totalSeconds;
        int hours = seconds / 3600;
        int minutes = (seconds % 3600) / 60;

        if (hours > 0 && minutes > 0) {
            return hours + " giờ " + minutes + " phút";
        }
        if (hours > 0) {
            return hours + " giờ";
        }
        if (minutes > 0) {
            return minutes + " phút";
        }
        return "Đang cập nhật";
    }
}
