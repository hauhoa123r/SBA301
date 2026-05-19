package com.app.controlleradvice;

import com.app.model.user.exception.InvalidLoginException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class handleLoginError {
    @ExceptionHandler(InvalidLoginException.class)
    public ResponseEntity<?> handleInvalidLoginException(InvalidLoginException e){
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", e.getMessage(), "status", 401));
    }
}
