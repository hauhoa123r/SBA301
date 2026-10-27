package com.app.features.contact.service;

import com.app.features.contact.dto.ContactDto.*;
import com.app.features.contact.dto.ContactCategory;
import com.app.features.contact.model.ContactMessage;
import com.app.features.contact.model.ContactMessage.Status;
import com.app.features.contact.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.Arrays;
import java.util.EnumMap;

@Service @RequiredArgsConstructor @Transactional(readOnly = true)
public class ContactService {
    private final ContactMessageRepository messages;

    @Transactional
    public Receipt submit(Submit body) {
        return submit(body, null);
    }

    @Transactional
    public Receipt submit(Submit body, Long userId) {
        var row = new ContactMessage();
        // Ownership comes from the authenticated principal, never a supplied email/user ID.
        row.setUserId(userId);
        row.setFullName(body.fullName().trim()); row.setEmail(body.email().trim());
        row.setTopic(body.topic().trim()); row.setMessage(body.message().trim());
        return new Receipt(messages.saveAndFlush(row).getId());
    }

    public Inbox inbox(Status status, int page) {
        return inbox(status, null, page);
    }

    public Inbox inbox(Status status, ContactCategory category, int page) {
        if (page < 0 || page > 100000) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trang không hợp lệ.");
        var pageable = PageRequest.of(page, 20, Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id")));
        var result = messages.inbox(status, category == null || category == ContactCategory.OTHER ? null : category.label(),
            category == ContactCategory.OTHER, ContactCategory.specificTopics(), pageable);
        return new Inbox(result.map(ContactService::item).getContent(), result.getTotalElements(), result.getTotalPages(), page,
            messages.countByStatus(Status.NEW));
    }

    public Statistics statistics() {
        var counts = new EnumMap<ContactCategory, long[]>(ContactCategory.class);
        for (var category : ContactCategory.values()) counts.put(category, new long[2]);
        for (var row : messages.countsByTopicAndStatus()) {
            var bucket = counts.get(ContactCategory.ofTopic((String) row[0]));
            bucket[row[1] == Status.NEW ? 0 : 1] += ((Number) row[2]).longValue();
        }
        var categories = Arrays.stream(ContactCategory.values()).map(category -> {
            var bucket = counts.get(category);
            return new CategoryCount(category, category.label(), bucket[0] + bucket[1], bucket[0], bucket[1]);
        }).toList();
        return new Statistics(categories.stream().mapToLong(CategoryCount::total).sum(),
            categories.stream().mapToLong(CategoryCount::unread).sum(), categories.stream().mapToLong(CategoryCount::resolved).sum(), categories);
    }

    @Transactional
    public Item updateStatus(Long id, Status status) {
        var row = messages.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy phản hồi."));
        row.setStatus(status);
        return item(row);
    }

    public static Item item(ContactMessage row) {
        return new Item(row.getId(), row.getFullName(), row.getEmail(), row.getTopic(), row.getMessage(), row.getStatus(), row.getCreatedAt(),
            row.getUserId()!=null,row.getReplyText(),row.getRepliedAt());
    }
}
