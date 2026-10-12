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
    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<Response<?>> denied(org.springframework.security.access.AccessDeniedException ex) {
        return error(HttpStatus.FORBIDDEN, "You do not have permission to access this resource.");
    }

    @ExceptionHandler(org.springframework.security.core.AuthenticationException.class)
    public ResponseEntity<Response<?>> unauthenticated(org.springframework.security.core.AuthenticationException ex) {
        return error(HttpStatus.UNAUTHORIZED, "Authentication is invalid or expired.");
    }

    @ExceptionHandler(org.springframework.web.server.ResponseStatusException.class)
    public ResponseEntity<Response<?>> status(org.springframework.web.server.ResponseStatusException ex) {
        Response<?> body = Response.builder().status(ex.getStatusCode().value())
                .message(ex.getReason() == null ? "Request rejected." : ex.getReason()).build();
        return ResponseEntity.status(ex.getStatusCode()).body(body);
    }

    @ExceptionHandler({org.springframework.http.converter.HttpMessageNotReadableException.class,
            org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class,
            IllegalArgumentException.class})
    public ResponseEntity<Response<?>> invalid(Exception ex) {
        return error(HttpStatus.BAD_REQUEST, "Invalid request.");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Response<?>> unexpected(Exception ex) {
        if (ex instanceof org.springframework.web.ErrorResponse error) {
            return ResponseEntity.status(error.getStatusCode()).body(Response.builder()
                    .status(error.getStatusCode().value()).message("Request rejected.").build());
        }
        org.slf4j.LoggerFactory.getLogger(GlobalExceptionHandler.class)
                .error("Unhandled backend error, type={}", ex.getClass().getSimpleName());
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to process this request.");
    }

    private ResponseEntity<Response<?>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Response.builder().status(status.value()).message(message).build());
    }

    @ExceptionHandler(BaseException.class)
    public ResponseEntity<Response<?>> handle(BaseException ex) {
        Response<?> response = Response.builder()
                .status(ex.getStatus().value())
                .message(ex.getMessage())
                .build();
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
