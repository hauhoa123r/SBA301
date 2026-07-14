package com.app.features.learning.repository;

import com.app.features.model.VocabularyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IVocabularyRepository extends JpaRepository<VocabularyEntity, Long> {
    List<VocabularyEntity> findByLessonIdOrderByOrderIndexAsc(Long lessonId);
}
