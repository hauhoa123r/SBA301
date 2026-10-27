package com.app.features.admin.service;

import com.app.exception.*;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;

@Service @RequiredArgsConstructor @Transactional(readOnly=true)
public class PaymentAnalyticsService {
    private final JdbcTemplate db;
    private final Clock clock;
    public record Bucket(String label, BigDecimal amount) {}
    public record StatusCount(String status,long count) {}
    public record Product(String type,Long courseId,String name,BigDecimal revenue) {}
    public record Transaction(long id,String transactionId,long invoiceId,long studentId,String student,String email,
        String product,String productType,BigDecimal amount,String method,String status,Instant paymentTime,
        Instant createdAt,BigDecimal refundedAmount,BigDecimal invoiceAmount,String invoiceStatus) {}
    public record Report(String timezone,LocalDate from,LocalDate to,String mode,BigDecimal totalRevenue,
        BigDecimal revenueThisMonth,BigDecimal revenue,BigDecimal refundedAmount,BigDecimal netRevenue,
        long successfulPayments,long pendingPayments,long failedPayments,long totalTransactions,
        long unknownPaymentTimes,List<Bucket> trend,List<StatusCount> statuses,List<Product> products,
        List<Transaction> content,long totalElements,int totalPages,int page,int size,List<String> notes) {}
    private static final String JOINS=" FROM payments p JOIN invoices i ON i.id=p.invoice_id JOIN users u ON u.id=i.user_id"
        +" LEFT JOIN courses c ON c.id=i.course_id LEFT JOIN subscription_plans sp ON sp.code=i.subscription_plan_code ";
    private static final String RANGE="((p.status='SUCCESS' AND p.paid_at>=? AND p.paid_at<?) OR (p.status<>'SUCCESS' AND p.created_at>=FROM_UNIXTIME(?) AND p.created_at<FROM_UNIXTIME(?)))";
    private static final String SELECT="""
        SELECT p.id,p.transaction_id,i.id invoice_id,u.id student_id,u.full_name,u.email,
          COALESCE(sp.name,c.title,i.subscription_plan_code,'Sản phẩm lịch sử') product,
          CASE WHEN i.subscription_plan_code IS NULL THEN 'COURSE' ELSE 'SUBSCRIPTION' END product_type,
          p.amount,p.provider,p.status,p.paid_at,UNIX_TIMESTAMP(p.created_at) created_epoch,
          (SELECT COALESCE(SUM(r.amount),0) FROM refunds r WHERE r.payment_id=p.id AND r.status='PROCESSED') refunded,
          i.amount invoice_amount,i.status invoice_status
        """;

    public Report report(AnalyticsRange range,String search,String status,int page,int size) {
        return report(range,search,status,page,size,false);
    }
    public Report report(AnalyticsRange range,String search,String status,int page,int size,boolean unknownOnly) {
        if (search.length()>200 || page<0 || page>100000 || size<1 || size>100
            || !Set.of("","CREATED","SUCCESS","FAILED","CANCELLED","EXPIRED").contains(status))
            throw new BadRequestException("Bộ lọc thanh toán không hợp lệ.");
        var args=rangeArgs(range);
        var statuses=db.query("SELECT p.status,COUNT(*) n FROM payments p WHERE "+RANGE+" GROUP BY p.status",
            (rs,i)->new StatusCount(rs.getString("status"),rs.getLong("n")),args.toArray());
        long success=count(statuses,"SUCCESS"),pending=count(statuses,"CREATED");
        long total=statuses.stream().mapToLong(StatusCount::count).sum();
        BigDecimal revenue=sum("SELECT COALESCE(SUM(amount),0) FROM payments WHERE status='SUCCESS' AND paid_at>=? AND paid_at<?",utc(range.start()),utc(range.end()));
        BigDecimal lifetime=sum("SELECT COALESCE(SUM(amount),0) FROM payments WHERE status='SUCCESS'");
        var month=YearMonth.from(today());
        BigDecimal thisMonth=sum("SELECT COALESCE(SUM(amount),0) FROM payments WHERE status='SUCCESS' AND paid_at>=? AND paid_at<?",
            utc(month.atDay(1).atStartOfDay(AnalyticsRange.ZONE).toInstant()),utc(month.plusMonths(1).atDay(1).atStartOfDay(AnalyticsRange.ZONE).toInstant()));
        long unknown=db.queryForObject("SELECT COUNT(*) FROM payments WHERE status='SUCCESS' AND paid_at IS NULL",Long.class);
        // PROCESSED is the sole completed-refund state; approval alone is not cash movement.
        BigDecimal refunds=sum("SELECT COALESCE(SUM(amount),0) FROM refunds WHERE status='PROCESSED' AND processed_at>=? AND processed_at<?",utc(range.start()),utc(range.end()));
        long invalid=db.queryForObject("""
            SELECT COUNT(*) FROM payments p WHERE
              EXISTS (SELECT 1 FROM refunds r WHERE r.payment_id=p.id AND r.status='PROCESSED' AND (r.processed_at IS NULL OR r.amount<=0))
              OR (SELECT COALESCE(SUM(r.amount),0) FROM refunds r WHERE r.payment_id=p.id AND r.status='PROCESSED')>p.amount
              OR (p.status<>'SUCCESS' AND EXISTS (SELECT 1 FROM refunds r WHERE r.payment_id=p.id AND r.status='PROCESSED'))
            """,Long.class);
        var values=new LinkedHashMap<String,BigDecimal>(); range.zeroCounts().forEach((k,v)->values.put(k,BigDecimal.ZERO));
        db.query("SELECT "+range.sqlLabel("paid_at")+" label,SUM(amount) amount FROM payments WHERE status='SUCCESS' AND paid_at>=? AND paid_at<? GROUP BY label",
            rs->{values.put(rs.getString("label"),rs.getBigDecimal("amount"));},utc(range.start()),utc(range.end()));
        var products=db.query("""
            SELECT CASE WHEN i.subscription_plan_code IS NULL THEN 'COURSE' ELSE 'SUBSCRIPTION' END type,
              i.course_id,COALESCE(sp.name,c.title,i.subscription_plan_code,'Sản phẩm lịch sử') product_name,SUM(p.amount) revenue
            """+JOINS+" WHERE p.status='SUCCESS' AND p.paid_at>=? AND p.paid_at<? GROUP BY type,i.course_id,i.subscription_plan_code,product_name ORDER BY revenue DESC",
            (rs,n)->new Product(rs.getString("type"),rs.getObject("course_id",Long.class),rs.getString("product_name"),rs.getBigDecimal("revenue")),utc(range.start()),utc(range.end()));
        if (unknownOnly) args.clear();
        String filter=" WHERE "+(unknownOnly?"p.status='SUCCESS' AND p.paid_at IS NULL":RANGE)+" AND (?='' OR p.status=?) AND (?='' OR u.full_name LIKE ? ESCAPE '!' OR u.email LIKE ? ESCAPE '!' OR p.transaction_id LIKE ? ESCAPE '!' OR COALESCE(sp.name,c.title,'') LIKE ? ESCAPE '!')";
        String pattern="%"+search.trim().replace("!","!!").replace("%","!%").replace("_","!_")+"%";
        args.addAll(List.of(status,status,search,pattern,pattern,pattern,pattern));
        long matched=db.queryForObject("SELECT COUNT(*)"+JOINS+filter,Long.class,args.toArray());
        args.add(size);args.add(page*size);
        var content=db.query(SELECT+JOINS+filter+" ORDER BY COALESCE(p.paid_at,TIMESTAMPADD(SECOND,UNIX_TIMESTAMP(p.created_at),CAST('1970-01-01 00:00:00' AS DATETIME))) DESC,p.id DESC LIMIT ? OFFSET ?",this::transaction,args.toArray());
        var notes=new ArrayList<String>(List.of("VND. Doanh thu toàn bộ = SUCCESS; số liệu còn lại theo khoảng ngày đã chọn. CREATED là đang chờ; FAILED/CANCELLED/EXPIRED không tạo doanh thu.",
            "Ngày thanh toán là thời điểm ứng dụng xác nhận thành công (UTC, hiển thị giờ Việt Nam). Giao dịch cũ thiếu ngày không được gán updated_at và không nằm trong thống kê có khoảng ngày.",
            "Doanh thu ròng theo dòng tiền = doanh thu trong khoảng − hoàn tiền PROCESSED có processed_at trong khoảng; có thể âm. Danh sách hoàn tiền từng giao dịch là toàn bộ lịch sử."));
        if (invalid>0) notes.add("Không hiển thị doanh thu ròng: có hoàn tiền thiếu thời điểm hoặc không khớp giao dịch/số tiền. Cần đối soát dữ liệu.");
        if (unknown>0) notes.add("Không hiển thị doanh thu ròng theo ngày khi còn SUCCESS thiếu thời điểm: không thể phân bổ chính xác doanh thu lịch sử vào khoảng chọn.");
        if (unknownOnly) notes.add("Danh sách đang chỉ hiển thị SUCCESS thiếu thời điểm trên toàn bộ lịch sử; các KPI và biểu đồ vẫn theo khoảng ngày đã chọn.");
        return new Report(AnalyticsRange.ZONE.getId(),range.from(),range.to(),range.mode(),lifetime,thisMonth,revenue,refunds,invalid==0 && unknown==0?revenue.subtract(refunds):null,
            success,pending,total-success-pending,total,unknown,values.entrySet().stream().map(e->new Bucket(e.getKey(),e.getValue())).toList(),statuses,products,content,matched,(int)((matched+size-1)/size),page,size,notes);
    }
    public Transaction detail(long id) {
        var rows=db.query(SELECT+JOINS+" WHERE p.id=?",this::transaction,id);
        if(rows.isEmpty()) throw new ResourceNotFoundException("Không tìm thấy giao dịch.");
        return rows.get(0);
    }
    private Transaction transaction(java.sql.ResultSet rs,int index) throws java.sql.SQLException {
        var paid=rs.getObject("paid_at",LocalDateTime.class);
        var created=rs.getBigDecimal("created_epoch");
        return new Transaction(rs.getLong("id"),rs.getString("transaction_id"),rs.getLong("invoice_id"),rs.getLong("student_id"),rs.getString("full_name"),rs.getString("email"),
            rs.getString("product"),rs.getString("product_type"),rs.getBigDecimal("amount"),rs.getString("provider"),rs.getString("status"),
            paid==null?null:paid.toInstant(ZoneOffset.UTC),created==null?null:Instant.ofEpochSecond(created.longValue()),rs.getBigDecimal("refunded"),rs.getBigDecimal("invoice_amount"),rs.getString("invoice_status"));
    }
    private List<Object> rangeArgs(AnalyticsRange r) { return new ArrayList<>(List.of(utc(r.start()),utc(r.end()),r.start().getEpochSecond(),r.end().getEpochSecond())); }
    private long count(List<StatusCount> rows,String status) { return rows.stream().filter(s->s.status().equals(status)).mapToLong(StatusCount::count).sum(); }
    private BigDecimal sum(String sql,Object... args) { return db.queryForObject(sql,BigDecimal.class,args); }
    private String utc(Instant time) { return LocalDateTime.ofInstant(time,ZoneOffset.UTC).toString().replace('T',' '); }
    public LocalDate today() { return LocalDate.now(clock.withZone(AnalyticsRange.ZONE)); }
}
