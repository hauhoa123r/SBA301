package com.app.features.courses.converter;

import com.app.features.courses.dto.response.CourseCatalogResponse;
import com.app.features.courses.dto.response.CourseDetailResponse;
import com.app.features.courses.repository.projection.CourseLessonStats;
import com.app.features.model.CategoryEntity;
import com.app.features.model.CourseEntity;
import com.app.features.model.PlanEntity;
import com.app.features.model.UserEntity;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Objects;

@Component
@RequiredArgsConstructor
public class CourseResponseConverter {
    private final ModelMapper modelMapper;
    private final ChapterResponseConverter chapterResponseConverter;
    private final DurationTextConverter durationTextConverter;

    public CourseCatalogResponse toCourseCatalogResponse(CourseEntity course, CourseLessonStats lessonStats) {
        CourseCatalogResponse response = modelMapper.map(course, CourseCatalogResponse.class);
        response.setThumbnailUrl(course.getThumbnailUrl());
        applyTeacher(response, course.getTeacher());
        applyCategory(response, course.getCategory());
        applyLessonStats(response, lessonStats);
        response.setRating(5.0);
        return response;
    }

    public CourseDetailResponse toCourseDetailResponse(CourseEntity course, CourseLessonStats lessonStats) {
        CourseDetailResponse response = modelMapper.map(course, CourseDetailResponse.class);
        response.setThumbnailUrl(course.getThumbnailUrl());

        UserEntity teacher = course.getTeacher();
        applyTeacher(response, teacher);
        if (teacher != null) {
            response.setTeacherId(teacher.getId());
        }
        CategoryEntity category = course.getCategory();
        applyCategory(response, category);
        if (category != null) {
            response.setCategoryId(category.getId());
        }
        response.setPrice(getLowestPlanPrice(course));
        response.setStudents(course.getCourseEnrollments() == null ? 0 : course.getCourseEnrollments().size());
        response.setLevel("Tất cả trình độ");
        response.setChapters(chapterResponseConverter.toChapterResponses(course));
        applyLessonStats(response, lessonStats);
        response.setRating(5.0);

        return response;
    }

    private void applyTeacher(CourseCatalogResponse response, UserEntity teacher) {
        if (teacher != null) {
            response.setInstructor(teacher.getFullName());
        }
    }

    private void applyTeacher(CourseDetailResponse response, UserEntity teacher) {
        if (teacher != null) {
            response.setInstructor(teacher.getFullName());
        }
    }

    private void applyCategory(CourseCatalogResponse response, CategoryEntity category) {
        if (category != null) {
            response.setCategory(category.getName());
        }
    }

    private void applyCategory(CourseDetailResponse response, CategoryEntity category) {
        if (category != null) {
            response.setCategory(category.getName());
        }
    }

    private void applyLessonStats(CourseCatalogResponse response, CourseLessonStats lessonStats) {
        int totalLessons = lessonStats == null || lessonStats.getTotalLessons() == null ? 0 : lessonStats.getTotalLessons().intValue();
        int totalDurationSeconds = lessonStats == null || lessonStats.getTotalDurationSeconds() == null ? 0 : lessonStats.getTotalDurationSeconds().intValue();
        response.setTotalLessons(totalLessons);
        response.setDurationText(durationTextConverter.toDurationText(totalDurationSeconds));
    }

    private void applyLessonStats(CourseDetailResponse response, CourseLessonStats lessonStats) {
        int totalLessons = lessonStats == null || lessonStats.getTotalLessons() == null ? 0 : lessonStats.getTotalLessons().intValue();
        int totalDurationSeconds = lessonStats == null || lessonStats.getTotalDurationSeconds() == null ? 0 : lessonStats.getTotalDurationSeconds().intValue();
        response.setTotalLessons(totalLessons);
        response.setTotalDurationSeconds(totalDurationSeconds);
        response.setDurationText(durationTextConverter.toDurationText(totalDurationSeconds));
        response.setDuration(response.getDurationText());
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
}
