package com.app.exception;

import org.springframework.http.HttpStatus;

// Lỗi dữ liệu đầu vào không hợp lệ trả về 400
public class BadRequestException extends BaseException {
    public BadRequestException(String message) {
        super(HttpStatus.BAD_REQUEST, message);
    }
}
