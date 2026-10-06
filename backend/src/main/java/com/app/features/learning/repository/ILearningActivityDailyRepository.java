package com.app.features.learning.repository;

import com.app.features.model.LearningActivityDailyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface ILearningActivityDailyRepository extends JpaRepository<LearningActivityDailyEntity, Long> {
    interface Day { LocalDate getDate(); long getWatchSeconds(); long getActivityCount(); }

    @Query("""
        select activity.activityDate as date, activity.watchSeconds as watchSeconds, activity.activityCount as activityCount
        from LearningActivityDailyEntity activity where activity.userId = :userId
        and activity.activityDate between :from and :to order by activity.activityDate
        """)
    List<Day> findActivity(@Param("userId") Long userId, @Param("from") LocalDate from, @Param("to") LocalDate to);
    @Modifying
    @Query(value = """
        insert into learning_activity_daily (user_id, activity_date, watch_seconds, activity_count)
        values (:userId, :date, :seconds, :count)
        on duplicate key update watch_seconds = watch_seconds + :seconds, activity_count = activity_count + :count
        """, nativeQuery = true)
    void record(@Param("userId") Long userId, @Param("date") LocalDate date,
                @Param("seconds") int seconds, @Param("count") int count);

    List<LearningActivityDailyEntity> findByUserIdAndActivityDateBetweenOrderByActivityDate(Long userId, LocalDate from, LocalDate to);
}
