package com.app.security.oauth.facebook;

import com.app.features.model.UserEntity;
import com.app.features.oauth.dto.OAuth2UserInfo;
import com.app.features.oauth.mapper.OAuth2UserInfoMapper;
import com.app.features.oauth.service.OAuthAccountService;
import com.app.security.oauth.CustomOAuth2User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {
    private final List<OAuth2UserInfoMapper> mappers;
    private final OAuthAccountService oauthAccountService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) throws OAuth2AuthenticationException {
        OAuth2User delegate = new DefaultOAuth2UserService().loadUser(request);
        String registrationId = request.getClientRegistration().getRegistrationId();
        OAuth2UserInfoMapper mapper = mappers.stream().filter(item -> item.supports(registrationId)).findFirst()
                .orElseThrow(() -> new OAuth2AuthenticationException(new OAuth2Error("unsupported_provider")));
        OAuth2UserInfo info = mapper.map(delegate.getAttributes());
        UserEntity user = oauthAccountService.findOrCreate(info);
        log.info("OAuth2 login succeeded, provider={}, providerUserId={}", info.provider(), info.providerUserId());
        return new CustomOAuth2User(delegate, user);
    }
}

