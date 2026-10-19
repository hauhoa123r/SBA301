package com.app.features.admin.service;

import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import java.sql.Date;
import java.time.*;
import java.util.*;

/** A bounded set of aggregate gauges; never attach user IDs/emails to metrics. */
@Component @Slf4j
public class LearningMetrics {
    private final JdbcTemplate db;
    private final Clock clock;
    private volatile long refreshedAt;
    private volatile Map<String,Double> snapshot=Map.of();
    public LearningMetrics(JdbcTemplate db,Clock clock,MeterRegistry registry) {
        this.db=db; this.clock=clock;
        for(int n:List.of(5,10,15)) Gauge.builder("learning.daily.threshold.users",this,m->m.value("m"+n)).tag("minutes",String.valueOf(n)).register(registry);
        Gauge.builder("learning.daily.active.users",this,m->m.value("active")).register(registry);
        Gauge.builder("learning.daily.watch.seconds",this,m->m.value("seconds")).register(registry);
        Gauge.builder("learning.course.started.users",this,m->m.value("started")).register(registry);
    }
    private synchronized double value(String key) {
        if(refreshedAt==0 || System.nanoTime()-refreshedAt>30_000_000_000L) {
            try {
                var row=db.queryForMap("""
                    SELECT COALESCE(SUM(CASE WHEN watch_seconds>0 OR activity_count>0 THEN 1 ELSE 0 END),0) active,
                    COALESCE(SUM(watch_seconds),0) seconds,
                    COALESCE(SUM(CASE WHEN watch_seconds>=300 THEN 1 ELSE 0 END),0) m5,
                    COALESCE(SUM(CASE WHEN watch_seconds>=600 THEN 1 ELSE 0 END),0) m10,
                    COALESCE(SUM(CASE WHEN watch_seconds>=900 THEN 1 ELSE 0 END),0) m15
                    FROM learning_activity_daily WHERE activity_date=?
                    """,Date.valueOf(LocalDate.now(clock.withZone(LearningAnalyticsService.ZONE))));
                Map<String,Double> next=new HashMap<>(); row.forEach((k,v)->next.put(k,((Number)v).doubleValue()));
                next.put("started",db.queryForObject("SELECT COUNT(DISTINCT user_id) FROM lesson_progress WHERE watch_seconds>0 OR is_completed=TRUE",Double.class));
                snapshot=Map.copyOf(next);
            } catch(RuntimeException e) { snapshot=Map.of(); log.warn("Cannot refresh learning metrics: {}",e.getMessage()); }
            refreshedAt=System.nanoTime();
        }
        return snapshot.getOrDefault(key,Double.NaN);
    }
}
