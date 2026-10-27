package com.app.features.contact.repository;

import com.app.features.contact.model.ContactMessage;
import com.app.features.contact.model.ContactMessage.Status;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("select m from ContactMessage m where m.id=:id")
    java.util.Optional<ContactMessage> findForReply(@Param("id") Long id);
    Page<ContactMessage> findByStatus(Status status, Pageable pageable);
    long countByStatus(Status status);

    @Query("select m from ContactMessage m where (:status is null or m.status = :status) "
        + "and (:topic is null or m.topic = :topic) and (:other = false or m.topic not in :known)")
    Page<ContactMessage> inbox(@Param("status") Status status, @Param("topic") String topic,
        @Param("other") boolean other, @Param("known") List<String> known, Pageable pageable);

    @Query("select m.topic, m.status, count(m) from ContactMessage m group by m.topic, m.status")
    List<Object[]> countsByTopicAndStatus();
}
