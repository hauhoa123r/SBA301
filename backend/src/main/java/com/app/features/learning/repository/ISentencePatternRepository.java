package com.app.features.learning.repository;

import com.app.features.model.SentencePatternEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ISentencePatternRepository extends JpaRepository<SentencePatternEntity, Long> {
    @Query("""
            SELECT pattern
            FROM SentencePatternEntity pattern
            LEFT JOIN FETCH pattern.vocabulary
            WHERE pattern.lesson.id IN :lessonIds
            ORDER BY pattern.orderIndex ASC
            """)
    List<SentencePatternEntity> findByLessonIds(@Param("lessonIds") Collection<Long> lessonIds);
}
