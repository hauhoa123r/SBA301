package com.app.security.oauth.google;

import com.app.features.model.UserEntity;
import com.app.features.oauth.mapper.OAuth2UserInfoMapper;
import com.app.features.oauth.service.OAuthAccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomOidcUserService implements OAuth2UserService<OidcUserRequest, OidcUser> {
    private final List<OAuth2UserInfoMapper> mappers;
    private final OAuthAccountService oauthAccountService;

    @Override
    public OidcUser loadUser(OidcUserRequest request) throws OAuth2AuthenticationException {
        OidcUser delegate = new OidcUserService().loadUser(request);
        String registrationId = request.getClientRegistration().getRegistrationId();
        OAuth2UserInfoMapper mapper = mappers.stream().filter(item -> item.supports(registrationId)).findFirst()
                .orElseThrow(() -> new OAuth2AuthenticationException(new OAuth2Error("unsupported_provider")));
        UserEntity user = oauthAccountService.findOrCreate(mapper.map(delegate.getClaims()));
        return new CustomOidcUser(delegate, user);
    }
}

