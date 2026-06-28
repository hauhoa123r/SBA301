package com.app.exception;

import org.springframework.http.HttpStatus;

// Lỗi không có quyền truy cập trả về 403
public class AccessDeniedException extends BaseException {
    public AccessDeniedException(String message) {
        super(HttpStatus.FORBIDDEN, message);
    }
}
