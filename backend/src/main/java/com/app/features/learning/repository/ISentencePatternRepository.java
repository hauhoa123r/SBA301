package com.app.features.learning.repository;

import com.app.features.model.SentencePatternEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ISentencePatternRepository extends JpaRepository<SentencePatternEntity, Long> {
    List<SentencePatternEntity> findByLessonIdOrderByOrderIndexAsc(Long lessonId);
}
