package com.app.features.learning.repository;

import com.app.features.model.QuizAttemptEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface IQuizAttemptLearningRepository extends JpaRepository<QuizAttemptEntity, Long> {
    @Query("""
        select distinct q.id from QuizAttemptEntity a join a.quiz q
        left join q.lessonEntity l left join l.chapter lc left join q.chapter c
        where a.user.id = :userId and a.isPassed = true
        and (lc.courseEntity.id = :courseId or (l.id is null and c.courseEntity.id = :courseId))
        """)
    List<Long> findPassedQuizIds(@Param("userId") Long userId, @Param("courseId") Long courseId);

    @Query("""
        select a from QuizAttemptEntity a join fetch a.quiz q
        left join q.lessonEntity l left join l.chapter lc left join q.chapter c
        where a.user.id = :userId
        and a.status = com.app.features.model.enums.QuizAttemptStatus.SUBMITTED
        and (lc.courseEntity.id = :courseId or (l.id is null and c.courseEntity.id = :courseId))
        and a.id = (select max(latest.id) from QuizAttemptEntity latest where latest.user.id = :userId and latest.quiz.id = q.id
            and latest.status = com.app.features.model.enums.QuizAttemptStatus.SUBMITTED)
        """)
    List<QuizAttemptEntity> findLatestInCourse(@Param("userId") Long userId, @Param("courseId") Long courseId);
}
