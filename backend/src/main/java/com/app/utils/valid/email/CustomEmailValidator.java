package com.app.utils.valid.email;

import com.app.utils.valid.RegexValidator;

public class CustomEmailValidator extends RegexValidator<CustomEmail> {
    private static final String EMAIL_REGEX = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
    @Override
    protected String getRegex() {
        return EMAIL_REGEX;
    }
}