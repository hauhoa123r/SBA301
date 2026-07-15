package com.app.features.model.enums;

public enum UserStatus {
    // tài khoản thông thường.
    ACTIVE,
    // tài khoản tạm khóa do nhập sai nhiều lần
    LOCKED,
    // tài khoản đã xóa (soft delete)
    DELETED,
    // tài khoản chưa kích hoạt (email validate)
    INACTIVE,
    // chờ xác minh/kích hoạt tài khoản.
    PENDING,
    // bị cấm tạm thời do vi phạm, có thể mở lại.
    SUSPENDED,
    // bị cấm vĩnh viễn khỏi hệ thống.
    BANNED,
    // Vô hiệu hóa bởi quản trị viên, không đăng nhập được.
    DISABLE
}
