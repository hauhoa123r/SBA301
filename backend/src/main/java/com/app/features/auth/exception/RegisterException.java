package com.app.features.auth.exception;

import com.app.exception.BaseException;
import org.springframework.http.HttpStatus;

public class RegisterException extends BaseException {
    public RegisterException(String message) {
        super(HttpStatus.BAD_REQUEST, message);
    }
}
