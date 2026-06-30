package com.app.features.courses.service.impl;

import com.app.exception.ResourceNotFoundException;
import com.app.features.courses.converter.CourseResponseConverter;
import com.app.features.courses.dto.response.CourseCatalogResponse;
import com.app.features.courses.dto.response.CourseDetailResponse;
import com.app.features.courses.repository.ICourseRepository;
import com.app.features.courses.repository.projection.CourseLessonStats;
import com.app.features.courses.service.ICourseService;
import com.app.features.model.CourseEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class CourseService implements ICourseService {
    private final ICourseRepository courseRepository;
    private final CourseResponseConverter courseResponseConverter;

    @Override
    @Transactional(readOnly = true)
    public List<CourseCatalogResponse> getAllCourses() {
        List<CourseEntity> courses = courseRepository.findAll();
        Map<Long, CourseLessonStats> lessonStatsByCourseId = getLessonStatsByCourseId(courses);

        return courses.stream()
                .map(course ->
                        courseResponseConverter.toCourseCatalogResponse(course, lessonStatsByCourseId.get(course.getId())
                )).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CourseResponse getCourseById(Long id) {
        CourseEntity course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        return toCourseResponse(course);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponse> getAllCourseByTeacherId(Long teacherId) {
        List<CourseEntity> courseEntities = courseRepository.findAllByTeacherId(teacherId);
        return courseEntities.stream().map(courseEntity -> toCourseResponse(courseEntity)).toList();
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

    private Map<Long, CourseLessonStats> getLessonStatsByCourseId(List<CourseEntity> courses) {
        List<Long> courseIds = courses.stream().map(CourseEntity::getId).filter(Objects::nonNull).toList();
        if (courseIds.isEmpty()) {
            return Map.of();
        }
        return courseRepository.findLessonStatsByCourseIds(courseIds)
                .stream()
                .collect(Collectors.toMap(CourseLessonStats::getCourseId, Function.identity()));
    }


}
