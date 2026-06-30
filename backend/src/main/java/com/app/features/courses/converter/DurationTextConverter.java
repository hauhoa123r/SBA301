package com.app.features.courses.converter;

import org.springframework.stereotype.Component;

@Component
public class DurationTextConverter {
    public String toDurationText(Integer totalSeconds) {
        int seconds = totalSeconds == null ? 0 : totalSeconds;
        int hours = seconds / 3600;
        int minutes = (seconds % 3600) / 60;
        if (hours > 0 && minutes > 0) {
            return hours + "h " + minutes + "m";
        }
        if (hours > 0) {
            return hours + "h";
        }
        if (minutes > 0) {
            return minutes + "m";
        }
        return "0m";
    }
}
