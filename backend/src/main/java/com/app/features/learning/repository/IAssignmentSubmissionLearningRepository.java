package com.app.features.learning.repository;

import com.app.features.model.AssignmentSubmissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;

public interface IAssignmentSubmissionLearningRepository extends JpaRepository<AssignmentSubmissionEntity, Long> {
    @EntityGraph(attributePaths = {"user", "assignment", "assignment.lesson", "assignment.lesson.chapter", "assignment.lesson.chapter.courseEntity"})
    Page<AssignmentSubmissionEntity> findByStatus(com.app.features.model.enums.AssignmentSubmissionStatus status, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"user", "assignment", "assignment.lesson", "assignment.lesson.chapter", "assignment.lesson.chapter.courseEntity"})
    Page<AssignmentSubmissionEntity> findAll(Pageable pageable);
    Optional<AssignmentSubmissionEntity> findFirstByUser_IdAndAssignment_IdOrderByIdDesc(Long userId, Long assignmentId);

    @Query("""
        select s from AssignmentSubmissionEntity s join fetch s.assignment a
        where s.user.id = :userId and a.lesson.chapter.courseEntity.id = :courseId
        and s.id = (select max(latest.id) from AssignmentSubmissionEntity latest where latest.user.id = :userId and latest.assignment.id = a.id)
        """)
    List<AssignmentSubmissionEntity> findLatestInCourse(@Param("userId") Long userId, @Param("courseId") Long courseId);
}
