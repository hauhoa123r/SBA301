package com.app.utils.valid.password;

import com.app.utils.valid.RegexValidator;

public class PasswordValidator extends RegexValidator<StrongPassword> {
    private static final String PASSWORD_REGEX = "^(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,16}$";
    @Override
    protected String getRegex() {
        return PASSWORD_REGEX;
    }
}