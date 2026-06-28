package com.app.utils.valid;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.lang.annotation.Annotation;

public abstract class RegexValidator<A extends Annotation> implements ConstraintValidator<A, String> {
    protected abstract String getRegex();
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) {
            return true;
        }
        return value.matches(getRegex());
    }
}
