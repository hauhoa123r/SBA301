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

    @Override
    @EntityGraph(attributePaths = {"teacher", "category"})
    List<CourseEntity> findAll();

    @Override
    @EntityGraph(attributePaths = {"teacher", "category", "plans", "courseEnrollments", "chapterEntities"})
    Optional<CourseEntity> findById(Long id);

    @Query("select c from CourseEntity c " +
            "join fetch c.category " +
            "join fetch c.teacher " +
            "where c.teacher.id = :teacherId " +
            "order by c.createdAt DESC")
    List<CourseEntity> findAllByTeacherId(Long teacherId);

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

    @Query("select c.id as courseId, " +
            "count(l.id) as totalLessons, " +
            "sum(l.durationSeconds) as totalDurationSeconds " +
            "from CourseEntity c " +
            "left join c.chapterEntities ch " +
            "left join ch.lessonEntities l " +
            "where c.id = :courseId " +
            "group by c.id")
    CourseLessonStats getLessonStatsByCourseId(@Param("courseId") Long courseId);

    List<CourseEntity> findAllByStatusOrderByCreatedAtDesc(CourseStatus status);
}

