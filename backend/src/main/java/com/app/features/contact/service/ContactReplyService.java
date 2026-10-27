package com.app.features.contact.service;

import com.app.features.contact.dto.ContactDto.Item;
import com.app.features.contact.model.ContactMessage.Status;
import com.app.features.contact.repository.ContactMessageRepository;
import com.app.features.notifications.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.Clock;
import static org.springframework.http.HttpStatus.*;

@Service @RequiredArgsConstructor
public class ContactReplyService {
    private final ContactMessageRepository messages;
    private final NotificationService notifications;
    private final Clock clock;
    @Transactional
    public Item reply(Long id, Long adminId, String text) {
        var row = messages.findForReply(id).orElseThrow(() -> new ResponseStatusException(NOT_FOUND,"Không tìm thấy góp ý."));
        String value = text.trim();
        if (value.isBlank() || value.length()>5000) throw new ResponseStatusException(BAD_REQUEST,"Nội dung trả lời không hợp lệ.");
        if (row.getRepliedAt()!=null) {
            if (value.equals(row.getReplyText())) return ContactService.item(row);
            throw new ResponseStatusException(CONFLICT,"Góp ý này đã được trả lời. Vui lòng tải lại danh sách.");
        }
        row.setReplyText(value); row.setRepliedAt(clock.instant()); row.setRepliedBy(adminId); row.setStatus(Status.RESOLVED);
        // Guest/legacy messages have no verified owner. Never infer recipients from the contact email.
        if (row.getUserId()!=null) notifications.feedbackReply(row.getUserId(),row.getId(),row.getTopic(),value);
        return ContactService.item(row);
    }
}
