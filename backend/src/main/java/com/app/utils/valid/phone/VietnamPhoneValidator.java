package com.app.utils.valid.phone;

import com.app.utils.valid.RegexValidator;

public class VietnamPhoneValidator extends RegexValidator<VietnamPhone> {
    private static final String PHONE_REGEX = "^(03|05|07|08|09)[0-9]{8}$";
    @Override
    protected String getRegex() {
        return PHONE_REGEX;
    }
}