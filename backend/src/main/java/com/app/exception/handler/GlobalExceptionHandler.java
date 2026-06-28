package com.app.exception.handler;

import com.app.exception.BaseException;
import com.app.publishDTO.exception.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(BaseException.class)
    public ResponseEntity<Response<?>> handle(BaseException ex) {
        Response<?> response = Response.builder()
                .status(ex.getStatus().value())
                .message(ex.getMessage())
                .build();
        return ResponseEntity.status(ex.getStatus()).body(response);
    }
}