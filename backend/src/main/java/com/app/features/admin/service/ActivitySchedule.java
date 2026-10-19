package com.app.features.admin.service;

import com.app.features.admin.dto.StudentManagement.AuditContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.*;
import java.sql.Date;
import java.time.*;

@Configuration @EnableScheduling @RequiredArgsConstructor @Slf4j
@ConditionalOnProperty(name="app.activity-lab.enabled",havingValue="true")
public class ActivitySchedule {
    private final JdbcTemplate db;
    private final ActivityLabService lab;
    private final Clock clock;
    private long cursor;
    @Scheduled(cron="${app.activity-lab.cron:0 */15 * * * *}",zone="Asia/Ho_Chi_Minh")
    public void run() {
        // Bounded batches; persistent date + row locks work across restarts and replicas.
        var candidates=db.queryForList("SELECT user_id,updated_by FROM user_learning_rules WHERE enabled=TRUE AND (last_run_date IS NULL OR last_run_date<?) AND user_id>? ORDER BY user_id LIMIT 100",
            Date.valueOf(LocalDate.now(clock.withZone(LearningAnalyticsService.ZONE))),cursor);
        if(candidates.isEmpty()) { cursor=0; return; }
        for(var row:candidates) {
            Long id=((Number)row.get("user_id")).longValue();
            try { lab.runScheduled(id,new AuditContext(((Number)row.get("updated_by")).longValue(),"SYSTEM","/api/admin/activity-lab/users/"+id,"","Daily schedule")); }
            catch(RuntimeException e) { log.warn("Daily activity failed for user {}: {}",id,e.getMessage()); }
            cursor=id;
        }
    }
}
