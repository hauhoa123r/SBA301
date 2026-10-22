package com.app.features.admin.service;

import com.app.exception.BadRequestException;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;

public record AnalyticsRange(LocalDate from, LocalDate to, String mode) {
    public static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    public AnalyticsRange {
        if (from==null || to==null || from.isAfter(to) || ChronoUnit.DAYS.between(from,to)>730
            || !Set.of("hour","day","month").contains(mode))
            throw new BadRequestException("Khoảng ngày tối đa 731 ngày; chế độ hour/day/month.");
    }
    public Instant start() { return from.atStartOfDay(ZONE).toInstant(); }
    public Instant end() { return to.plusDays(1).atStartOfDay(ZONE).toInstant(); }
    public long days() { return ChronoUnit.DAYS.between(from,to)+1; }
    public AnalyticsRange previous() { return new AnalyticsRange(from.minusDays(days()),from.minusDays(1),mode); }
    public String sqlLabel(String utcDate) {
        String pattern = switch(mode) { case "hour" -> "%H:00"; case "month" -> "%Y-%m"; default -> "%Y-%m-%d"; };
        return "DATE_FORMAT(DATE_ADD("+utcDate+", INTERVAL 7 HOUR), '"+pattern+"')";
    }
    public LinkedHashMap<String,Long> zeroCounts() {
        var result = new LinkedHashMap<String,Long>();
        if (mode.equals("hour")) for (int hour=0;hour<24;hour++) result.put(String.format(Locale.ROOT,"%02d:00",hour),0L);
        else if (mode.equals("month")) for (var m=YearMonth.from(from);!m.isAfter(YearMonth.from(to));m=m.plusMonths(1)) result.put(m.toString(),0L);
        else from.datesUntil(to.plusDays(1)).forEach(d->result.put(d.toString(),0L));
        return result;
    }
}
