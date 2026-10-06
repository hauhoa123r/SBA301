package com.app.features.admin.service;

import com.app.exception.BadRequestException;
import com.app.exception.ResourceNotFoundException;
import com.app.features.admin.dto.StudentManagement.*;
import com.app.features.admin.repository.*;
import com.app.features.model.*;
import com.app.features.model.enums.UserStatus;
import com.app.features.payments.repository.PaymentUserRepository;
import com.app.features.subscriptions.repository.*;
import com.app.features.subscriptions.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service @RequiredArgsConstructor @Transactional(readOnly = true)
public class StudentManagementService {
    private final StudentManagementRepository students;
    private final PaymentUserRepository users;
    private final UserSubscriptionRepository subscriptions;
    private final SubscriptionPlanRepository plans;
    private final AdminAuditRepository audit;
    private final Clock clock;
    private static final Instant MAX_EXPIRY = Instant.parse("2038-01-19T03:14:07Z");

    public StudentPage list(String search, String status, String subscription, int page) {
        if (page < 0 || page > 100000 || search.length() > 200) throw new BadRequestException("Bộ lọc không hợp lệ.");
        if (!status.isEmpty()) {
            try { UserStatus.valueOf(status); } catch (IllegalArgumentException e) { throw new BadRequestException("Trạng thái tài khoản không hợp lệ."); }
        }
        if (!Set.of("", "NONE", "ACTIVE", "EXPIRED", "SCHEDULED").contains(subscription)) throw new BadRequestException("Trạng thái gói không hợp lệ.");
        return students.list(search.trim(), status, subscription, page, clock.instant());
    }
    public Detail detail(Long id) {
        var student = students.find(id, clock.instant());
        if (student == null) throw new ResourceNotFoundException("Không tìm thấy học viên.");
        return new Detail(student, students.courses(id), students.history(id));
    }
    @Transactional public Detail changeStatus(Long id, StatusRequest request, AuditContext context) {
        var user = lockStudent(id);
        UserStatus next = UserStatus.valueOf(request.status());
        if (user.getStatus() != UserStatus.ACTIVE && user.getStatus() != UserStatus.DISABLE)
            throw new BadRequestException("Chỉ khóa/mở khóa tài khoản đã kích hoạt hoặc bị Admin khóa.");
        if (next != user.getStatus()) {
            var before = Map.of("status", user.getStatus().name()); user.setStatus(next); users.saveAndFlush(user);
            audit.write(context, "STUDENT_STATUS", target(id), before, Map.of("status", next.name()), request.reason());
        }
        return detail(id);
    }
    @Transactional public Detail grant(Long id, GrantRequest request, AuditContext context) {
        lockStudent(id);
        var plan = plans.findByCodeAndActiveTrue(request.planCode()).orElseThrow(() -> new BadRequestException("Gói học không tồn tại hoặc đã ngừng bán."));
        if (SubscriptionService.FREE_TRIAL.equals(plan.getCode())) throw new BadRequestException("Không cấp lại gói học thử qua quản trị.");
        var subscription = subscriptions.findByUserIdForUpdate(id).orElse(null);
        var before = snapshot(subscription);
        Instant now = clock.instant().truncatedTo(ChronoUnit.SECONDS);
        boolean extend = "EXTEND".equals(request.mode()) && subscription != null && subscription.getExpiresAt().isAfter(now)
            && !subscription.getStartedAt().isAfter(now) && !SubscriptionService.FREE_TRIAL.equals(subscription.getPlanCode());
        Instant expiry = (extend ? subscription.getExpiresAt() : now).plus(request.days(), ChronoUnit.DAYS);
        if (expiry.isAfter(MAX_EXPIRY)) throw new BadRequestException("Ngày hết hạn vượt quá giới hạn database (tháng 1/2038).");
        if (subscription == null) { subscription = new UserSubscriptionEntity(); subscription.setUserId(id); }
        if (!extend) subscription.setStartedAt(now);
        subscription.setPlanCode(plan.getCode()); subscription.setExpiresAt(expiry); subscription.setTrialUsed(true);
        subscriptions.saveAndFlush(subscription);
        audit.write(context, "SUBSCRIPTION_GRANT", target(id), before, snapshot(subscription), request.reason());
        return detail(id);
    }
    @Transactional public Detail revoke(Long id, ReasonRequest request, AuditContext context) {
        lockStudent(id);
        var subscription = subscriptions.findByUserIdForUpdate(id).orElseThrow(() -> new BadRequestException("Học viên chưa có gói để thu hồi."));
        Instant now = clock.instant().truncatedTo(ChronoUnit.SECONDS);
        if (!subscription.getExpiresAt().isAfter(now)) throw new BadRequestException("Gói học đã hết hạn hoặc đã được thu hồi.");
        var before = snapshot(subscription);
        if (!subscription.getStartedAt().isBefore(now)) subscription.setStartedAt(now.minusSeconds(1));
        subscription.setExpiresAt(now); subscription.setTrialUsed(true); subscriptions.saveAndFlush(subscription);
        audit.write(context, "SUBSCRIPTION_REVOKE", target(id), before, snapshot(subscription), request.reason());
        return detail(id);
    }
    public List<Plan> plans() { return plans.findAll(org.springframework.data.domain.Sort.by("price", "code")).stream().map(this::plan).toList(); }
    @Transactional public Plan savePlan(String code, PlanRequest request, boolean create, AuditContext context) {
        if (!code.equals(request.code())) throw new BadRequestException("Không được đổi mã gói học.");
        boolean trial = SubscriptionService.FREE_TRIAL.equals(code);
        if ((trial && request.price().signum() != 0) || (!trial && request.price().signum() <= 0))
            throw new BadRequestException("Gói trả phí phải có giá lớn hơn 0; gói học thử phải có giá bằng 0.");
        var entity = plans.findById(code).orElse(null);
        if (create && (entity != null || trial)) throw new BadRequestException("Mã gói đã tồn tại hoặc được dành riêng.");
        if (!create && entity == null) throw new ResourceNotFoundException("Không tìm thấy gói học.");
        var before = entity == null ? null : plan(entity);
        if (entity == null) { entity = new SubscriptionPlanEntity(); entity.setCode(code); }
        entity.setName(request.name().trim()); entity.setPrice(request.price()); entity.setDurationDays(request.durationDays()); entity.setActive(request.active());
        if (create) {
            try { students.insertPlan(entity); }
            catch (org.springframework.dao.DataIntegrityViolationException e) { throw new BadRequestException("Mã gói đã tồn tại. Vui lòng chọn mã khác."); }
        } else plans.saveAndFlush(entity);
        var result = plan(entity);
        audit.write(context, create ? "PLAN_CREATE" : "PLAN_UPDATE", "/api/admin/subscription-plans/" + code, before, result, request.reason());
        return result;
    }
    private UserEntity lockStudent(Long id) {
        var user = users.findByIdForUpdate(id).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy học viên."));
        if (!students.isStudent(id)) throw new BadRequestException("Chỉ quản lý học viên; không được thay đổi tài khoản Admin.");
        return user;
    }
    private Plan plan(SubscriptionPlanEntity entity) { return new Plan(entity.getCode(), entity.getName(), entity.getPrice(), entity.getDurationDays(), entity.isActive()); }
    private Map<String, Object> snapshot(UserSubscriptionEntity s) {
        return s == null ? Map.of() : Map.of("planCode", s.getPlanCode(), "startedAt", s.getStartedAt().toString(), "expiresAt", s.getExpiresAt().toString());
    }
    private String target(Long id) { return "/api/admin/students/" + id; }
}
