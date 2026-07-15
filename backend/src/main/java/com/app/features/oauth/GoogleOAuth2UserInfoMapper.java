package com.app.features.oauth;

import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class GoogleOAuth2UserInfoMapper implements OAuth2UserInfoMapper {
    @Override
    public boolean supports(String registrationId) {
        return "google".equalsIgnoreCase(registrationId);
    }

    @Override
    public OAuth2UserInfo map(Map<String, Object> attributes) {
        return new OAuth2UserInfo(AuthProvider.GOOGLE, string(attributes.get("sub")),
                string(attributes.get("email")), string(attributes.get("name")),
                string(attributes.get("picture")), booleanValue(attributes.get("email_verified")));
    }

    private String string(Object value) { return value instanceof String text ? text : null; }
    private boolean booleanValue(Object value) {
        return value instanceof Boolean flag ? flag : value instanceof String text && Boolean.parseBoolean(text);
    }
}
