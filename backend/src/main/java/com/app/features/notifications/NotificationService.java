package com.app.features.notifications;

import com.app.features.model.NotificationEntity;
import com.app.features.payments.repository.PaymentUserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.*;
import java.util.List;
import static org.springframework.http.HttpStatus.*;

@Service @RequiredArgsConstructor @Transactional(readOnly = true)
public class NotificationService {
    private final NotificationRepository notifications;
    private final PaymentUserRepository users;
    private final RecommendationService recommendations;
    private final ObjectMapper json;
    private final Clock clock;
    public record Payload(String text, String path) {}
    public record Item(Long id, String type, String title, String content, boolean read, Instant createdAt, String path) {}
    public record Inbox(List<Item> content, long unreadCount, int totalPages, int page) {}
    public record Daily(RecommendationService.Recommendation recommendation, boolean created) {}

    public Inbox inbox(Long userId, int page) {
        if (page < 0 || page > 10000) throw new ResponseStatusException(BAD_REQUEST, "Trang không hợp lệ.");
        var rows = notifications.findByUser_IdOrderByCreatedAtDescIdDesc(userId, PageRequest.of(page, 20));
        return new Inbox(rows.map(this::item).getContent(), notifications.countByUser_IdAndIsReadFalse(userId), rows.getTotalPages(), page);
    }
    @Transactional
    public void read(Long userId, Long id) {
        var row = notifications.findByIdAndUser_Id(id, userId)
            .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Không tìm thấy thông báo."));
        row.setIsRead(true);
    }
    @Transactional public void readAll(Long userId) { notifications.markAllRead(userId); }

    @Transactional
    public Daily daily(Long userId) {
        users.findByIdForUpdate(userId).orElseThrow(() -> new ResponseStatusException(NOT_FOUND));
        var next = recommendations.next(userId);
        LocalDate today = LocalDate.now(clock.withZone(com.app.features.learning.service.LearningStreakService.ZONE));
        Instant from = today.atStartOfDay(com.app.features.learning.service.LearningStreakService.ZONE).toInstant();
        Instant to = today.plusDays(1).atStartOfDay(com.app.features.learning.service.LearningStreakService.ZONE).toInstant();
        if (next == null || notifications.existsByUser_IdAndTypeAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(userId,"STUDY_REMINDER",from,to))
            return new Daily(next, false);
        create(userId, "STUDY_REMINDER", "Bài học dành cho bạn hôm nay", "Tiếp tục “"+next.lessonTitle()+"” trong khóa “"+next.courseTitle()+"”. Dành vài phút để giữ nhịp học nhé!", next.path());
        return new Daily(next, true);
    }

    @Transactional
    public void feedbackReply(Long userId, Long messageId, String topic, String text) {
        create(userId, "FEEDBACK_REPLY", "Edujar đã trả lời góp ý #"+messageId,
            "Chủ đề: "+topic+"\n\n"+text, "/learning#notifications");
    }
    private void create(Long userId, String type, String title, String content, String path) {
        var row = new NotificationEntity(); row.setUser(users.getReferenceById(userId)); row.setType(type);
        row.setTitle(title); row.setIsRead(false); row.setCreatedAt(clock.instant());
        try { row.setContent(json.writeValueAsString(new Payload(content,path))); }
        catch (JsonProcessingException ex) { throw new IllegalStateException("Cannot encode notification"); }
        notifications.saveAndFlush(row);
    }
    private Item item(NotificationEntity row) {
        String text = row.getContent(), path = null;
        if (List.of("STUDY_REMINDER","FEEDBACK_REPLY").contains(row.getType())) {
            try {
                var payload = json.readValue(text, Payload.class); text=payload.text();
                if (payload.path()!=null && payload.path().matches("/learning(?:#notifications|/courses/[0-9]+/lessons/[0-9]+)")) path=payload.path();
            } catch (JsonProcessingException ignored) { /* Historical plain-text content remains readable. */ }
        }
        return new Item(row.getId(),row.getType(),row.getTitle(),text,Boolean.TRUE.equals(row.getIsRead()),row.getCreatedAt(),path);
    }
}
