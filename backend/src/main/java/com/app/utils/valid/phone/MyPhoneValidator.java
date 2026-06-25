package com.app.utils.valid.phone;

public class MyPhoneValidator {
    private static final String PHONE_REGEX = "^(03|05|07|08|09)[0-9]{8}$";
    public static boolean isValid(String phone) {
        return phone != null && phone.matches(PHONE_REGEX);
    }
}
