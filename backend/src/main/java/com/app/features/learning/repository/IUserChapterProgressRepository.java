package com.app.features.learning.repository;

import com.app.features.model.UserChapterProgressEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IUserChapterProgressRepository extends JpaRepository<UserChapterProgressEntity, Long> {
    Optional<UserChapterProgressEntity> findByUserEntity_IdAndChapterEntity_Id(Long userId, Long chapterId);

    @Query("""
            SELECT progress.chapterEntity.id
            FROM UserChapterProgressEntity progress
            WHERE progress.userEntity.id = :userId
              AND progress.chapterEntity.courseEntity.id = :courseId
              AND progress.isCompleted = true
            ORDER BY progress.chapterEntity.orderIndex
            """)
    List<Long> findCompletedChapterIds(@Param("userId") Long userId, @Param("courseId") Long courseId);
}
