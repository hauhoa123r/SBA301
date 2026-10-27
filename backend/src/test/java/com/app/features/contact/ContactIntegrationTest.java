package com.app.features.contact;

import com.app.features.contact.dto.ContactDto.*;
import com.app.features.contact.dto.ContactCategory;
import com.app.features.contact.model.ContactMessage;
import com.app.features.contact.model.ContactMessage.Status;
import com.app.features.contact.repository.ContactMessageRepository;
import com.app.features.contact.service.ContactService;
import com.app.security.support.InMemoryDatabaseGuard;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.*;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.test.context.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest(showSql = false) @ActiveProfiles("security-test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ContextConfiguration(classes = ContactIntegrationTest.Config.class, initializers = InMemoryDatabaseGuard.class)
class ContactIntegrationTest {
    @Configuration @EnableAutoConfiguration @EntityScan(basePackageClasses = ContactMessage.class)
    @EnableJpaRepositories(basePackageClasses = ContactMessageRepository.class) @Import(ContactService.class)
    static class Config {}
    @Autowired ContactService service;
    @Autowired EntityManager em;

    @Test void anonymousMessagePersistsAndAdminCanProcessAndReopenIt() {
        var receipt = service.submit(new Submit(" Người dùng ", "user@example.test", " Góp ý ", " Tiếng Việt\n中文 <script>text</script> "));
        em.clear();
        var inbox = service.inbox(null, 0);
        assertEquals(1, inbox.totalElements()); assertEquals(1, inbox.unreadCount());
        var message = inbox.content().get(0);
        assertEquals(receipt.id(), message.id()); assertEquals("Người dùng", message.fullName());
        assertEquals("Tiếng Việt\n中文 <script>text</script>", message.message());
        assertEquals(Status.NEW, message.status()); assertNotNull(message.createdAt());
        service.updateStatus(receipt.id(), Status.RESOLVED); em.flush(); em.clear();
        assertEquals(0, service.inbox(Status.NEW, 0).totalElements());
        assertEquals(0, service.inbox(null, 0).unreadCount());
        assertEquals(1, service.inbox(Status.RESOLVED, 0).totalElements());
        service.updateStatus(receipt.id(), Status.NEW); em.flush(); em.clear();
        assertEquals(1, service.inbox(null, 0).unreadCount());
        assertEquals(message.createdAt(), service.inbox(null, 0).content().get(0).createdAt());
    }
    @Test void pagesHaveStableNewestFirstOrderAndBoundedSize() {
        for (int i = 0; i < 23; i++) {
            var receipt = service.submit(new Submit("User", "user@example.test", "Góp ý", "Message " + i));
            em.find(ContactMessage.class, receipt.id()).setCreatedAt(Instant.parse("2026-10-27T00:00:00Z"));
        }
        em.flush(); em.clear();
        var first = service.inbox(null, 0); var second = service.inbox(null, 1);
        assertEquals(23, first.totalElements()); assertEquals(2, first.totalPages());
        assertEquals(20, first.content().size()); assertEquals(3, second.content().size());
        assertEquals("Message 22", first.content().get(0).message());
        assertEquals("Message 2", second.content().get(0).message());
        assertTrue(service.inbox(null, 2).content().isEmpty());
    }
    @Test void invalidPagesAndMissingMessagesReturnClearClientErrors() {
        assertEquals(400, assertThrows(ResponseStatusException.class, () -> service.inbox(null, -1)).getStatusCode().value());
        assertEquals(400, assertThrows(ResponseStatusException.class, () -> service.inbox(null, Integer.MAX_VALUE)).getStatusCode().value());
        assertEquals(404, assertThrows(ResponseStatusException.class, () -> service.updateStatus(Long.MAX_VALUE, Status.NEW)).getStatusCode().value());
    }
    @Test void statisticsCountAllMessagesAndGroupRemovedTopicsWithoutEditingHistory() {
        String[] topics = {"Hỗ trợ khóa học", "Hỗ trợ khóa học", "Gói đăng ký và thanh toán", "Sự cố kỹ thuật", "Góp ý về website",
            "Lộ trình học HSK", "Luyện phát âm", "Custom old topic", "Khác"};
        for (int i = 0; i < topics.length; i++) {
            var receipt = service.submit(new Submit("User", "user@example.test", topics[i], "Message " + i));
            if (i == 1 || i == 3 || i == 6 || i == 8) service.updateStatus(receipt.id(), Status.RESOLVED);
        }
        em.flush(); em.clear();
        var stats = service.statistics();
        assertEquals(9, stats.totalReceived()); assertEquals(5, stats.unreadCount()); assertEquals(4, stats.resolvedCount());
        assertEquals(java.util.List.of(2L, 1L, 1L, 1L, 4L), stats.categories().stream().map(CategoryCount::total).toList());
        assertEquals(4, service.inbox(null, ContactCategory.OTHER, 0).totalElements());
        assertEquals(2, service.inbox(Status.NEW, ContactCategory.OTHER, 0).totalElements());
        assertEquals(1, service.inbox(Status.RESOLVED, ContactCategory.COURSE_SUPPORT, 0).totalElements());
        assertTrue(service.inbox(null, ContactCategory.OTHER, 0).content().stream().anyMatch(row -> row.topic().equals("Lộ trình học HSK")));
        assertEquals(9, service.inbox(null, 0).totalElements());
    }
    @Test void categoryFilterRunsBeforePagingAndStatusChangesRefreshCounts() {
        for (int i = 0; i < 25; i++) service.submit(new Submit("User", "user@example.test", "Hỗ trợ khóa học", "Course " + i));
        var target = service.submit(new Submit("User", "user@example.test", "Sự cố kỹ thuật", "Need help"));
        em.flush(); em.clear();
        var inbox = service.inbox(Status.NEW, ContactCategory.TECHNICAL, 0);
        assertEquals(1, inbox.totalElements()); assertEquals(target.id(), inbox.content().get(0).id());
        service.updateStatus(target.id(), Status.RESOLVED); em.flush(); em.clear();
        assertEquals(0, service.inbox(Status.NEW, ContactCategory.TECHNICAL, 0).totalElements());
        var stats = service.statistics();
        assertEquals(26, stats.totalReceived()); assertEquals(25, stats.unreadCount()); assertEquals(1, stats.resolvedCount());
    }
    @Test void emptyStatisticsHaveAllFiveCategoriesAndZeroTotals() {
        var stats = service.statistics();
        assertEquals(0, stats.totalReceived()); assertEquals(0, stats.unreadCount()); assertEquals(0, stats.resolvedCount());
        assertEquals(5, stats.categories().size());
        assertTrue(stats.categories().stream().allMatch(row -> row.total() == 0));
    }
}
