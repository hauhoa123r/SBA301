package com.app.features.oauth.mapper;

import com.app.features.oauth.dto.OAuth2UserInfo;
import com.app.features.oauth.entity.AuthProvider;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class FacebookOAuth2UserInfoMapper implements OAuth2UserInfoMapper {
    @Override
    public boolean supports(String registrationId) {
        return "facebook".equalsIgnoreCase(registrationId);
    }

    @Override
    public OAuth2UserInfo map(Map<String, Object> attributes) {
        return new OAuth2UserInfo(AuthProvider.FACEBOOK, string(attributes.get("id")),
                string(attributes.get("email")), string(attributes.get("name")), avatar(attributes), true);
    }

    @SuppressWarnings("unchecked")
    private String avatar(Map<String, Object> attributes) {
        Object picture = attributes.get("picture");
        if (!(picture instanceof Map<?, ?> pictureMap)) return null;
        Object data = pictureMap.get("data");
        if (!(data instanceof Map<?, ?> dataMap)) return null;
        Object url = dataMap.get("url");
        return url instanceof String text ? text : null;
    }

    private String string(Object value) { return value instanceof String text ? text : null; }
}
