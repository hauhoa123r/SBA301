package com.app.exception.handler;

import com.app.exception.BaseException;
import com.app.publishDTO.exception.Response;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(BaseException.class)
    public ResponseEntity<Response<?>> handle(BaseException ex) {
        Response<?> response = Response.builder().status(ex.getStatus().value()).message(ex.getMessage()).build();
        return ResponseEntity.status(ex.getStatus()).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Response<Map<String, String>>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.putIfAbsent(error.getField(), error.getDefaultMessage())
        );

        Response<Map<String, String>> response = Response.<Map<String, String>>builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message("Dữ liệu không hợp lệ")
                .data(errors)
                .build();

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Response<Map<String, String>>> handleConstraintViolation(ConstraintViolationException ex) {
        Map<String, String> errors = ex.getConstraintViolations().stream()
                .collect(Collectors.toMap(
                        violation -> violation.getPropertyPath().toString(),
                        violation -> violation.getMessage(),
                        (first, ignored) -> first,
                        LinkedHashMap::new
                ));

        Response<Map<String, String>> response = Response.<Map<String, String>>builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message("Dữ liệu không hợp lệ")
                .data(errors)
                .build();

        return ResponseEntity.badRequest().body(response);
    }
}
