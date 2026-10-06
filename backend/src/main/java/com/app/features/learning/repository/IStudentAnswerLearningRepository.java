package com.app.features.learning.repository;

import com.app.features.model.StudentAnswerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import java.util.List;

public interface IStudentAnswerLearningRepository extends JpaRepository<StudentAnswerEntity, Long> {
    @EntityGraph(attributePaths = {"question", "question.answerEntities", "selectedAnswer", "attempt"})
    List<StudentAnswerEntity> findByAttempt_IdIn(List<Long> attemptIds);
}
