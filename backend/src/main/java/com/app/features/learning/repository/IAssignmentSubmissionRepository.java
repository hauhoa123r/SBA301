package com.app.features.learning.repository;

import com.app.features.model.AssignmentSubmissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface IAssignmentSubmissionRepository extends JpaRepository<AssignmentSubmissionEntity, Long> {
    @Query("SELECT COUNT(asub) FROM AssignmentSubmissionEntity asub " +
           "WHERE asub.user.id = :userId AND asub.assignment.lesson.chapter.courseEntity.id = :courseId")
    long countSubmissionsByCourse(@Param("userId") Long userId, @Param("courseId") Long courseId);
}
