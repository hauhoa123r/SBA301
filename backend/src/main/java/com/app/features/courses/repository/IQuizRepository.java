package com.app.features.courses.repository;

import com.app.features.model.QuizEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IQuizRepository extends JpaRepository<QuizEntity, Long> {
    List<QuizEntity> findByTeacherId(Long teacherId);
}
