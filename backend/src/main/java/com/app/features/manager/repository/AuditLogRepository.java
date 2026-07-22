package com.app.features.manager.repository;

import com.app.features.model.AuditLogEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLogEntity, Long> {

    @Query(
            value = """
                SELECT
                    DISTINCT a.id,
                    a.user_id,
                    u.full_name,
                    r.name,
                    a.action,
                    c.title,
                    COALESCE(
                        JSON_UNQUOTE(JSON_EXTRACT(a.after_data, '$.code')),
                        JSON_UNQUOTE(JSON_EXTRACT(a.before_data, '$.code'))
                    ),
                    a.created_at
                FROM audit_logs a
                JOIN users u ON u.id = a.user_id
                JOIN user_roles ur ON ur.user_id = u.id
                JOIN roles r ON r.id = ur.role_id
                LEFT JOIN courses c ON c.id = CAST(
                    JSON_UNQUOTE(JSON_EXTRACT(a.after_data, '$.courseId')) AS UNSIGNED
                )
                WHERE r.name IN ('TEACHER', 'MODERATOR')
                AND (
                    :keyword IS NULL
                    OR LOWER(COALESCE(u.full_name, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(COALESCE(r.name, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(a.action) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(COALESCE(c.title, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(a.after_data, '$.code')), '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(a.before_data, '$.code')), '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                )
                ORDER BY a.created_at DESC
            """,
            countQuery = """
                SELECT COUNT(DISTINCT a.id)
                FROM audit_logs a
                JOIN users u ON u.id = a.user_id
                JOIN user_roles ur ON ur.user_id = u.id
                JOIN roles r ON r.id = ur.role_id
                LEFT JOIN courses c ON c.id = CAST(
                    JSON_UNQUOTE(JSON_EXTRACT(a.after_data, '$.courseId')) AS UNSIGNED
                )
                WHERE r.name IN ('TEACHER', 'MODERATOR')
                AND (
                    :keyword IS NULL
                    OR LOWER(COALESCE(u.full_name, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(COALESCE(r.name, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(a.action) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(COALESCE(c.title, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(a.after_data, '$.code')), '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(a.before_data, '$.code')), '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                )
            """,
            nativeQuery = true
    )
    Page<Object[]> findAuditLogSummaries(
            @Param("keyword") String keyword,
            Pageable pageable
    );
}
