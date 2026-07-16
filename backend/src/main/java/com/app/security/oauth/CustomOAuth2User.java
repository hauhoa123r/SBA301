package com.app.security.oauth;

import com.app.features.model.UserEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Map;

public class CustomOAuth2User implements OAuth2User {
    private final OAuth2User delegate;
    private final UserEntity user;

    public CustomOAuth2User(OAuth2User delegate, UserEntity user) {
        this.delegate = delegate;
        this.user = user;
    }

    public UserEntity getUser() { return user; }
    @Override public Map<String, Object> getAttributes() { return delegate.getAttributes(); }
    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return delegate.getAuthorities(); }
    @Override public String getName() { return delegate.getName(); }
}
