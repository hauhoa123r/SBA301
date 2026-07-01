package com.app.utils;

public final class StringUtils {
    private StringUtils() {
    }

    public static String shorten(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }

    public static String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    public static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
