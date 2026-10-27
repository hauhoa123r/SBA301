package com.app.features.notifications;

import com.app.features.model.NotificationEntity;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.time.Instant;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {
    Page<NotificationEntity> findByUser_IdOrderByCreatedAtDescIdDesc(Long userId, Pageable page);
    long countByUser_IdAndIsReadFalse(Long userId);
    boolean existsByUser_IdAndTypeAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(Long userId, String type, Instant from, Instant to);
    Optional<NotificationEntity> findByIdAndUser_Id(Long id, Long userId);
    @Modifying @Query("update NotificationEntity n set n.isRead=true where n.user.id=:userId and n.isRead=false")
    int markAllRead(@Param("userId") Long userId);
}
