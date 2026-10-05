package com.app.features.admin;

import com.app.exception.BadRequestException;
import com.app.features.admin.repository.DashboardRepository;
import com.app.features.admin.service.DashboardService;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.ZoneOffset;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class DashboardServiceTest {
    private final DashboardRepository repository = mock(DashboardRepository.class);
    private final Instant now = Instant.parse("2026-09-30T18:00:00Z");
    private final DashboardService service = new DashboardService(repository, Clock.fixed(now, ZoneOffset.UTC));

    @Test
    void bucketsUseVietnamDateAtUtcMonthBoundary() {
        service.dashboard("7d", 10);
        verify(repository).overview(now, Instant.parse("2026-09-30T17:00:00Z"), Instant.parse("2026-09-30T17:00:00Z"));
        verify(repository).trends(YearMonth.of(2025, 11), ZoneId.of("Asia/Ho_Chi_Minh"), now);
        verify(repository).popular(Instant.parse("2026-09-23T18:00:00Z"), now, 10);
    }

    @Test
    void invalidFiltersNeverReachDatabase() {
        assertThrows(BadRequestException.class, () -> service.dashboard("unknown", 5));
        assertThrows(BadRequestException.class, () -> service.dashboard("all", 500));
        assertThrows(BadRequestException.class, () -> service.courses("", "", -1, 10));
        assertThrows(BadRequestException.class, () -> service.courses("", "", 0, 101));
        assertThrows(BadRequestException.class, () -> service.courses("", "DELETED", 0, 10));
        verifyNoInteractions(repository);
    }
}
