package com.app.features.admin.service;

import com.app.exception.BadRequestException;
import com.app.features.admin.dto.DashboardResponse;
import com.app.features.admin.dto.DashboardResponse.CoursePage;
import com.app.features.admin.repository.DashboardRepository;
import com.app.features.model.enums.CourseStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {
    private static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final Set<String> PERIODS = Set.of("7d", "30d", "3m", "1y", "all");
    private final DashboardRepository repository;
    private final Clock clock;

    public DashboardResponse dashboard(String period, int limit) {
        if (!PERIODS.contains(period) || (limit != 5 && limit != 10)) {
            throw new BadRequestException("Khoảng thời gian hoặc số lượng khóa học không hợp lệ.");
        }
        Instant now = clock.instant();
        var local = now.atZone(ZONE);
        Instant since = switch (period) {
            case "7d" -> now.minus(7, ChronoUnit.DAYS);
            case "30d" -> now.minus(30, ChronoUnit.DAYS);
            case "3m" -> local.minusMonths(3).toInstant();
            case "1y" -> local.minusYears(1).toInstant();
            default -> Instant.EPOCH;
        };
        return new DashboardResponse(now, "VND", ZONE.getId(),
                repository.overview(now, local.toLocalDate().atStartOfDay(ZONE).toInstant(),
                        local.withDayOfMonth(1).toLocalDate().atStartOfDay(ZONE).toInstant()),
                repository.subscriptions(now), repository.trends(YearMonth.from(local).minusMonths(11), ZONE, now),
                repository.popular(since, now, limit));
    }

    public CoursePage courses(String search, String status, int page, int size) {
        if (page < 0 || page > 1000000 || size < 1 || size > 100 || search.length() > 200) {
            throw new BadRequestException("Tham số phân trang hoặc tìm kiếm không hợp lệ.");
        }
        if (!status.isEmpty()) {
            try { CourseStatus.valueOf(status); }
            catch (IllegalArgumentException exception) { throw new BadRequestException("Trạng thái khóa học không hợp lệ."); }
        }
        return repository.courses(search.trim(), status, page, size);
    }
}
