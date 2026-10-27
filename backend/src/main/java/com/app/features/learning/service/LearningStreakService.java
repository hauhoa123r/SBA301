package com.app.features.learning.service;

import com.app.features.learning.repository.ILearningActivityDailyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.*;

@Service @RequiredArgsConstructor
public class LearningStreakService {
    public static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private final ILearningActivityDailyRepository daily;
    private final Clock clock;

    public record Streak(int current, int longest, boolean activeToday, LocalDate lastActivityDate, String timezone) {}

    @Transactional(readOnly = true)
    public Streak get(Long userId) {
        LocalDate today = LocalDate.now(clock.withZone(ZONE));
        return calculate(daily.findActiveDates(userId, today), today);
    }

    public static Streak calculate(Collection<LocalDate> activity, LocalDate today) {
        var days = new TreeSet<LocalDate>();
        activity.stream().filter(Objects::nonNull).filter(day -> !day.isAfter(today)).forEach(days::add);
        int run = 0, longest = 0; LocalDate previous = null;
        for (LocalDate date : days) {
            run = previous != null && previous.plusDays(1).equals(date) ? run + 1 : 1;
            longest = Math.max(longest, run); previous = date;
        }
        int current = previous != null && !previous.isBefore(today.minusDays(1)) ? run : 0;
        return new Streak(current, longest, days.contains(today), previous, ZONE.getId());
    }
}
