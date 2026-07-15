package com.app.features.oauth;

import java.util.Map;

public interface OAuth2UserInfoMapper {
    boolean supports(String registrationId);
    OAuth2UserInfo map(Map<String, Object> attributes);
}
