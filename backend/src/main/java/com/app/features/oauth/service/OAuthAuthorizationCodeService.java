package com.app.features.oauth.service;

import com.app.features.model.UserEntity;

public interface OAuthAuthorizationCodeService {
    String create(UserEntity user);

    UserEntity consume(String rawCode);
}
