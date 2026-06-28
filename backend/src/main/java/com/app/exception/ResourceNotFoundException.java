package com.app.exception;


import org.springframework.http.HttpStatus;

// Lỗi không tìm thấy tài nguyên trả về 404
public class ResourceNotFoundException extends BaseException{
    public ResourceNotFoundException(String message) {
        super(HttpStatus.NOT_FOUND, message);
    }
}
