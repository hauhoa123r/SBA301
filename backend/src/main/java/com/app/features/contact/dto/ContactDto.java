package com.app.features.contact.dto;

import com.app.features.contact.model.ContactMessage.Status;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.List;

public final class ContactDto {
    private ContactDto() {}
    public record Submit(
        @NotBlank @Size(max = 100) String fullName,
        @NotBlank @Email @Size(max = 254) String email,
        @NotBlank @Size(max = 100) String topic,
        @NotBlank @Size(max = 5000) String message
    ) {}
    public record Receipt(Long id) {}
    public record Item(Long id, String fullName, String email, String topic, String message, Status status, Instant createdAt,
                       boolean registeredSender, String reply, Instant repliedAt) {}
    public record Inbox(List<Item> content, long totalElements, int totalPages, int page, long unreadCount) {}
    public record UpdateStatus(@NotNull Status status) {}
    public record Reply(@NotBlank @Size(max = 5000) String text) {}
    public record CategoryCount(ContactCategory category, String label, long total, long unread, long resolved) {}
    public record Statistics(long totalReceived, long unreadCount, long resolvedCount, List<CategoryCount> categories) {}
}
