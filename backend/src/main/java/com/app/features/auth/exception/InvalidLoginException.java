package com.app.features.auth.exception;

import com.app.exception.BaseException;
import org.springframework.http.HttpStatus;

public class InvalidLoginException extends BaseException{
        public InvalidLoginException(String message) {
            super(HttpStatus.BAD_REQUEST, message);
        }
}
