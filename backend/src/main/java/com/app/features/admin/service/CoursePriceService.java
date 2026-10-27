package com.app.features.admin.service;

import com.app.exception.ResourceNotFoundException;
import com.app.features.admin.dto.StudentManagement.AuditContext;
import com.app.features.admin.repository.AdminAuditRepository;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.util.Map;

@Service @RequiredArgsConstructor
public class CoursePriceService {
    private final JdbcTemplate db;
    private final AdminAuditRepository audit;
    public record PriceRequest(
        @NotNull @DecimalMin("0") @Digits(integer=13,fraction=2) BigDecimal price,
        @NotNull @DecimalMin("0") @Digits(integer=13,fraction=2) BigDecimal expectedPrice,
        @NotBlank @Size(max=500) String reason) {}

    @Transactional
    public Map<String,Object> update(Long id, PriceRequest body, AuditContext actor) {
        var rows = db.queryForList("SELECT price,status FROM courses WHERE id=? FOR UPDATE", id);
        if (rows.isEmpty()) throw new ResourceNotFoundException("Không tìm thấy khóa học.");
        BigDecimal previous = (BigDecimal) rows.get(0).get("price");
        if (previous.compareTo(body.expectedPrice()) != 0)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Giá đã được thay đổi. Làm mới dữ liệu trước khi lưu.");
        if (previous.compareTo(body.price()) != 0) {
            db.update("UPDATE courses SET price=? WHERE id=?", body.price(), id);
            audit.write(actor,"COURSE_PRICE_UPDATE","/api/admin/dashboard/courses/"+id,
                Map.of("price",previous),Map.of("price",body.price()),body.reason());
        }
        return Map.of("id",id,"price",body.price(),"status",rows.get(0).get("status"));
    }
}
