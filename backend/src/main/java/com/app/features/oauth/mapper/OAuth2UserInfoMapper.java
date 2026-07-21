package com.app.features.oauth.mapper;

import com.app.features.oauth.dto.OAuth2UserInfo;

import java.util.Map;

public interface OAuth2UserInfoMapper {
    boolean supports(String registrationId);

    OAuth2UserInfo map(Map<String, Object> attributes);
}
