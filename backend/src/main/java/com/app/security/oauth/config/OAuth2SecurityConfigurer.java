package com.app.security.oauth.config;

import com.app.security.oauth.OAuth2AuthenticationFailureHandler;
import com.app.security.oauth.OAuth2AuthenticationSuccessHandler;
import com.app.security.oauth.facebook.CustomOAuth2UserService;
import com.app.security.oauth.google.CustomOidcUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.oauth2.client.OAuth2LoginConfigurer;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OAuth2SecurityConfigurer {

    private final CustomOAuth2UserService oauth2UserService;
    private final CustomOidcUserService oidcUserService;
    private final OAuth2AuthenticationSuccessHandler successHandler;
    private final OAuth2AuthenticationFailureHandler failureHandler;

    public void configure(OAuth2LoginConfigurer<HttpSecurity> oauth) {
        oauth.authorizationEndpoint(endpoint -> endpoint
                        .baseUri("/api/oauth2/authorization")
                )
                .redirectionEndpoint(endpoint -> endpoint
                        .baseUri("/login/oauth2/code/*")
                )
                .userInfoEndpoint(userInfo -> userInfo
                        .userService(oauth2UserService)
                        .oidcUserService(oidcUserService)
                )
                .successHandler(successHandler)
                .failureHandler(failureHandler);
    }
}