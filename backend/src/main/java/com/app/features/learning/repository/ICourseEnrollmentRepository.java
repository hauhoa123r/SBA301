package com.app.features.learning.repository;

import com.app.features.model.CourseEnrollmentEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface ICourseEnrollmentRepository extends JpaRepository<CourseEnrollmentEntity, Long> {
    @EntityGraph(attributePaths = "course")
    List<CourseEnrollmentEntity> findByUser_Id(Long userId);

    Optional<CourseEnrollmentEntity> findByUser_IdAndCourse_Id(Long userId, Long courseId);

    boolean existsByUser_IdAndCourse_Id(Long userId, Long courseId);

    @Modifying
    @Query("update CourseEnrollmentEntity e set e.legacyAccess = true where e.user.id = :userId and e.course.id = :courseId")
    int grantLegacyAccess(@Param("userId") Long userId, @Param("courseId") Long courseId);

    @Modifying
    @Query(value = """
            INSERT INTO course_enrollments (user_id, course_id, enrolled_at)
            VALUES (:userId, :courseId, :enrolledAt)
            ON DUPLICATE KEY UPDATE id = id
            """, nativeQuery = true)
    int insertIfAbsent(@Param("userId") Long userId,
                       @Param("courseId") Long courseId,
                       @Param("enrolledAt") Instant enrolledAt);
}
