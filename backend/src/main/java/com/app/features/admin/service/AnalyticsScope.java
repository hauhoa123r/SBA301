package com.app.features.admin.service;

/** Trusted provenance only; never guess from a person's name or email. Alias must be internal SQL. */
public final class AnalyticsScope {
    private AnalyticsScope() {}
    public static String student(String alias, boolean includeLab) {
        return "EXISTS (SELECT 1 FROM user_roles ar JOIN roles rr ON rr.id=ar.role_id WHERE ar.user_id="+alias+".id AND rr.name='STUDENT')"
            + " AND NOT EXISTS (SELECT 1 FROM user_roles ar JOIN roles rr ON rr.id=ar.role_id WHERE ar.user_id="+alias+".id AND rr.name='ADMIN')"
            + (includeLab ? "" : " AND NOT EXISTS (SELECT 1 FROM user_learning_rules lr WHERE lr.user_id="+alias+".id)"
            + " AND NOT EXISTS (SELECT 1 FROM audit_logs al WHERE al.endpoint=CONCAT('/api/admin/activity-lab/users/',"+alias+".id)"
            + " AND al.action IN ('ADMIN_ACCOUNT_CREATE','ACTIVITY_RUN'))");
    }
}
