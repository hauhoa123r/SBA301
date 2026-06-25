package com.app.utils.valid.phone;

import java.lang.reflect.Field;

public class ValidationPhoneEngine {
    public static void validate(Object object) throws IllegalAccessException {
        for (Field field : object.getClass().getDeclaredFields()) {
            field.setAccessible(true);
            if (field.isAnnotationPresent(VietnamPhone.class)) {
                String value = (String) field.get(object);
                if (!MyPhoneValidator.isValid(value)) {
                    VietnamPhone annotation = field.getAnnotation(VietnamPhone.class);
                    throw new RuntimeException(annotation.message());
                }
            }
        }
    }
}
