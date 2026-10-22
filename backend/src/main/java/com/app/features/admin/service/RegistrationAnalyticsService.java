package com.app.features.admin.service;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.*;
import java.time.*;
import java.util.*;

@Service @RequiredArgsConstructor @Transactional(readOnly=true)
public class RegistrationAnalyticsService {
    private final JdbcTemplate db;
    private final Clock clock;
    public record Bucket(String label,long count) {}
    public record Spike(String hour,long count) {}
    public record Report(String timezone, LocalDate from,LocalDate to,String mode,boolean includeLab,
        long total,long previousTotal,BigDecimal changePercent,long activeStudents,long totalUsers,List<Bucket> buckets,
        List<Spike> hourlySignals,List<String> notes) {}

    public Report report(AnalyticsRange range,boolean includeLab) {
        String scope=AnalyticsScope.student("u",includeLab);
        var buckets=range.zeroCounts();
        // UNIX_TIMESTAMP reads database-generated TIMESTAMP independently of session timezone.
        String utc="TIMESTAMPADD(SECOND,UNIX_TIMESTAMP(u.created_at),CAST('1970-01-01 00:00:00' AS DATETIME))";
        String filter=" FROM users u WHERE "+scope+" AND u.created_at>=FROM_UNIXTIME(?) AND u.created_at<FROM_UNIXTIME(?)";
        db.query("SELECT "+range.sqlLabel(utc)+" label,COUNT(*) n"+filter+" GROUP BY label",rs->{
            buckets.put(rs.getString("label"),rs.getLong("n"));
        },range.start().getEpochSecond(),range.end().getEpochSecond());
        long total=buckets.values().stream().mapToLong(Long::longValue).sum();
        var previous=range.previous();
        long prev=db.queryForObject("SELECT COUNT(*)"+filter,Long.class,previous.start().getEpochSecond(),previous.end().getEpochSecond());
        long active=db.queryForObject("SELECT COUNT(*) FROM users u WHERE "+scope+" AND u.status='ACTIVE'",Long.class);
        long totalUsers=db.queryForObject("SELECT COUNT(*) FROM users WHERE status<>'DELETED'",Long.class);
        // Baseline includes zero hours, bounded by the actual requested calendar interval.
        double average=total/(range.days()*24.0);
        var signals=db.query("SELECT DATE_FORMAT(DATE_ADD("+utc+",INTERVAL 7 HOUR),'%Y-%m-%d %H:00') label,COUNT(*) n"+filter
            +" GROUP BY label HAVING COUNT(*)>=10 AND COUNT(*)>? ORDER BY label",
            (rs,i)->new Spike(rs.getString("label"),rs.getLong("n")),range.start().getEpochSecond(),range.end().getEpochSecond(),average*3);
        BigDecimal change=prev==0?null:BigDecimal.valueOf(total-prev).multiply(BigDecimal.valueOf(100)).divide(BigDecimal.valueOf(prev),1,RoundingMode.HALF_UP);
        return new Report(AnalyticsRange.ZONE.getId(),range.from(),range.to(),range.mode(),includeLab,total,prev,change,active,totalUsers,
            buckets.entrySet().stream().map(e->new Bucket(e.getKey(),e.getValue())).toList(),signals,List.of(
            "Đăng ký lịch sử gồm học viên đã khóa/xóa; tài khoản ACTIVE là chỉ số riêng tại thời điểm truy vấn.",
            includeLab?"Bao gồm tài khoản Activity Lab đã nhận diện.":"Loại tài khoản có dấu vết Activity Lab/rule; seed hoặc bot không có nguồn đánh dấu đáng tin cậy vẫn có thể nằm trong dữ liệu.",
            "Kỳ trước có cùng số ngày, liền trước khoảng chọn. Hour cộng theo giờ trong ngày trên toàn khoảng.",
            "Giờ có ít nhất 10 đăng ký và vượt 3 lần trung bình giờ được gắn tín hiệu xem xét; không phải kết luận tấn công."));
    }
    public LocalDate today() { return LocalDate.now(clock.withZone(AnalyticsRange.ZONE)); }
}
