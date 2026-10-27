package com.app.features.contact.dto;

import java.util.Arrays;
import java.util.List;

public enum ContactCategory {
    COURSE_SUPPORT("Hỗ trợ khóa học"),
    SUBSCRIPTION("Gói đăng ký và thanh toán"),
    TECHNICAL("Sự cố kỹ thuật"),
    WEBSITE("Góp ý về website"),
    OTHER("Khác");

    private final String label;
    ContactCategory(String label) { this.label = label; }
    public String label() { return label; }
    public static List<String> specificTopics() {
        return Arrays.stream(values()).filter(c -> c != OTHER).map(ContactCategory::label).toList();
    }
    public static ContactCategory ofTopic(String topic) {
        return Arrays.stream(values()).filter(c -> c.label.equals(topic)).findFirst().orElse(OTHER);
    }
}
