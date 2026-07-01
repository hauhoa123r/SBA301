package com.app.features.courses.service.impl;

import com.app.exception.ResourceNotFoundException;
import com.app.features.categories.service.ICategoryService;
import com.app.features.courses.converter.CourseResponseConverter;
import com.app.features.courses.dto.request.CourseRequest;
import com.app.features.courses.dto.response.CourseCatalogResponse;
import com.app.features.courses.dto.response.CourseDetailResponse;
import com.app.features.courses.repository.ICourseRepository;
import com.app.features.courses.repository.projection.CourseLessonStats;
import com.app.features.courses.service.ICourseService;
import com.app.features.model.*;
import com.app.features.model.enums.CourseStatus;
import com.app.features.plans.service.IPlanService;
import com.app.features.tags.service.ITagService;
import com.app.features.user.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class CourseService implements ICourseService {
    private final ICourseRepository courseRepository;
    private final CourseResponseConverter courseResponseConverter;
    private final ITagService tagService;
    private final IPlanService planService;
    private final ICategoryService categoryService;
    private final IUserRepository userRepository;

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
    public CourseDetailResponse getCourseById(Long id) {
        CourseEntity course = courseRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        Map<Long, CourseLessonStats> lessonStatsByCourseId = getLessonStatsByCourseId(List.of(course));
        return courseResponseConverter.toCourseDetailResponse(course, lessonStatsByCourseId.get(course.getId())
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseDetailResponse> getAllCourseByTeacherId(Long teacherId) {
        List<CourseEntity> courseEntities = courseRepository.findAllByTeacherId(teacherId);
        return courseEntities.stream().map(courseEntity -> {
            CourseLessonStats stats = courseRepository.getLessonStatsByCourseId(courseEntity.getId());
            return courseResponseConverter.toCourseDetailResponse(courseEntity, stats);
        }).toList();
    }

    @Override
    @Transactional
    public Long createCourse(CourseRequest request, Long teacherId) {
        UserEntity teacher = userRepository.findById(teacherId).orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + teacherId));

        CategoryEntity category = categoryService.findCategoryById(request.getCategoryId());

        CourseEntity course = new  CourseEntity();
        course.setTitle(request.getTitle());
        course.setTeacher(teacher);
        course.setCategory(category);
        course.setDescription(request.getDescription());
        course.setThumbnailUrl(request.getThumbnailUrl());
        course.setStatus(CourseStatus.DRAFT);

        if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
            List<TagEntity> tags = tagService.findAllById(request.getTagIds());
            for(TagEntity tag :  tags) {
                course.addTag(tag);
            }
        }

        if (request.getPlanIds() != null && !request.getPlanIds().isEmpty()) {
            List<PlanEntity> plans = planService.findAllByIds(request.getPlanIds());
            for(PlanEntity plan : plans) {
                course.addPlan(plan);
            }
        }

        return courseRepository.save(course).getId();
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
