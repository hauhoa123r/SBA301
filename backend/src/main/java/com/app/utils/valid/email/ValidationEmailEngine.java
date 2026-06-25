package com.app.utils.valid.email;

import java.lang.reflect.Field;

public class ValidationEmailEngine {

    public static void validate(Object object) throws IllegalAccessException {
        for (Field field : object.getClass().getDeclaredFields()) {
            field.setAccessible(true);
            if (field.isAnnotationPresent(MyValidEmail.class)) {
                String value = (String) field.get(object);
                if (!MyEmailValidator.isValid(value)) {
                    MyValidEmail annotation = field.getAnnotation(MyValidEmail.class);
                    throw new RuntimeException(annotation.message());
                }
            }
        }
    }
}