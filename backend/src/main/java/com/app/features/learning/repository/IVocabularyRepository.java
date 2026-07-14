package com.app.features.learning.repository;

import com.app.features.model.VocabularyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface IVocabularyRepository extends JpaRepository<VocabularyEntity, Long> {
    @Query("""
            SELECT vocabulary
            FROM VocabularyEntity vocabulary
            WHERE vocabulary.lesson.id IN :lessonIds
            ORDER BY vocabulary.orderIndex ASC
            """)
    List<VocabularyEntity> findByLessonIds(@Param("lessonIds") Collection<Long> lessonIds);
}
