package com.app.features.auth.exception;

import com.app.exception.BaseException;
import org.springframework.http.HttpStatus;

public class UnsupportedAccountRoleException extends BaseException {
    public static final String MESSAGE =
            "UNSUPPORTED_ACCOUNT_ROLE: This account does not have the supported STUDENT role";

    public UnsupportedAccountRoleException() {
        super(HttpStatus.UNAUTHORIZED, MESSAGE);
    }
}
