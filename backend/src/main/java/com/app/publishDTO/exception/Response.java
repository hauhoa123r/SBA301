package com.app.publishDTO.exception;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Response<T> {
    private int status;
    private String message;
    private T data;
}