package com.app.features.courses.repository;

import com.app.features.courses.repository.projection.CourseLessonStats;
import com.app.features.model.CourseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface ICourseRepository extends JpaRepository<CourseEntity,Long> {
<<<<<<< HEAD
    @Override
    @EntityGraph(attributePaths = {"teacher", "category"})
    List<CourseEntity> findAll();

    @Override
    @EntityGraph(attributePaths = {"teacher", "category", "plans", "courseEnrollments", "chapterEntities"})
    Optional<CourseEntity> findById(Long id);

    @EntityGraph(attributePaths = {"teacher", "category"})
    List<CourseEntity> findAllByTeacherId(Long teacherId);
=======
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
>>>>>>> main
}
