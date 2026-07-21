package com.app.features.oauth.service;

import com.app.features.model.UserEntity;
import com.app.features.oauth.dto.OAuth2UserInfo;

public interface OAuthAccountService {
    UserEntity findOrCreate(OAuth2UserInfo info);
}
