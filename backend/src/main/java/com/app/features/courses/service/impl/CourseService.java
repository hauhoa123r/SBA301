package com.app.features.courses.service.impl;

import com.app.exception.ResourceNotFoundException;
import com.app.features.courses.converter.CourseResponseConverter;
import com.app.features.courses.dto.response.CourseCatalogResponse;
import com.app.features.courses.dto.response.CourseDetailResponse;
import com.app.features.courses.repository.ICourseRepository;
import com.app.features.courses.repository.projection.CourseLessonStats;
import com.app.features.courses.service.ICourseService;
import com.app.features.model.CourseEntity;
import com.app.features.model.enums.CourseStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
public class CourseService implements ICourseService {
    private final ICourseRepository courseRepository;
    private final CourseResponseConverter courseResponseConverter;

    @Override
    @Transactional(readOnly = true)
    public List<CourseCatalogResponse> getAllCourses() {
        log.info("Loading course catalog");
        List<CourseEntity> courses = courseRepository.findAllByStatusOrderByCreatedAtDesc(CourseStatus.PUBLISHED);
        if (courses.isEmpty()) {
            log.warn("Course catalog is empty");
        }
        Map<Long, CourseLessonStats> lessonStatsByCourseId = getLessonStatsByCourseId(courses);

        List<CourseCatalogResponse> responses = courses.stream()
                .map(course ->
                        courseResponseConverter.toCourseCatalogResponse(course, lessonStatsByCourseId.get(course.getId())
                )).toList();
        log.info("Course catalog loaded successfully, courseCount={}", responses.size());
        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public CourseDetailResponse getCourseById(Long id) {
        log.info("Loading course detail, courseId={}", id);
        CourseEntity course = courseRepository.findByIdAndStatus(id, CourseStatus.PUBLISHED).orElseThrow(() -> {
            log.warn("Course not found, courseId={}", id);
            return new ResourceNotFoundException("Course not found with id: " + id);
        });
        Map<Long, CourseLessonStats> lessonStatsByCourseId = getLessonStatsByCourseId(List.of(course));
        return courseResponseConverter.toCourseDetailResponse(course, lessonStatsByCourseId.get(course.getId())
        );
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
