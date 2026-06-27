package com.app.utils.valid.phone;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = VietnamPhoneValidator.class)
public @interface VietnamPhone {
    String message() default "Số điện thoại không đúng định dạng số Việt Nam ";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};

}