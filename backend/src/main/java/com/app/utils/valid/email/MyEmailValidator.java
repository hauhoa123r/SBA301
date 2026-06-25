package com.app.utils.valid.email;

public class MyEmailValidator {
    private static final String EMAIL_REGEX = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
    public static boolean isValid(String email) {
        return email != null && email.matches(EMAIL_REGEX);
    }
}