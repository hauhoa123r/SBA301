package com.app.features.courses.repository;

import com.app.features.courses.repository.projection.CourseLessonStats;
import com.app.features.model.CourseEntity;
import com.app.features.model.enums.CourseStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ICourseRepository extends JpaRepository<CourseEntity,Long> {
    boolean existsByIdAndStatus(Long id, CourseStatus status);

    @Override
    // Fetch chapters separately from enrollments to avoid multiplying list entries.
    @EntityGraph(attributePaths = {"teacher", "category", "chapterEntities"})
    Optional<CourseEntity> findById(Long id);

    @EntityGraph(attributePaths = {"teacher", "category", "chapterEntities"})
    Optional<CourseEntity> findByIdAndStatus(Long id, CourseStatus status);

    @EntityGraph(attributePaths = {"teacher", "category"})
    List<CourseEntity> findAllByStatusOrderByCreatedAtDesc(CourseStatus status);

    @Query("""
            select c.id as courseId,
                   count(l.id) as totalLessons,
                   coalesce(sum(l.durationSeconds), 0) as totalDurationSeconds
            from CourseEntity c
            left join c.chapterEntities ch
            left join ch.lessonEntities l
            where c.id in :courseIds
            group by c.id
            """)
    List<CourseLessonStats> findLessonStatsByCourseIds(@Param("courseIds") Collection<Long> courseIds);

}
