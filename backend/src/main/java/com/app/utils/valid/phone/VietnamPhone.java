package com.app.utils.valid.phone;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface VietnamPhone {

    String message() default "Số điện thoại Việt Nam không hợp lệ";
}