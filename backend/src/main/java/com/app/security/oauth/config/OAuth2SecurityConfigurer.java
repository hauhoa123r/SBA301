package com.app.security.oauth.config;

import com.app.security.oauth.OAuth2AuthenticationFailureHandler;
import com.app.security.oauth.OAuth2AuthenticationSuccessHandler;
import com.app.security.oauth.google.CustomOidcUserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.oauth2.client.OAuth2LoginConfigurer;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OAuth2SecurityConfigurer {

    private final CustomOidcUserService oidcUserService;
    private final OAuth2AuthenticationSuccessHandler successHandler;
    private final OAuth2AuthenticationFailureHandler failureHandler;
    private final ClientRegistrationRepository clients;

    public void configure(OAuth2LoginConfigurer<HttpSecurity> oauth) {
        oauth.authorizationEndpoint(endpoint -> endpoint
                        .baseUri("/api/oauth2/authorization")
                        .authorizationRequestResolver(googleAuthorizationRequests())
                )
                .redirectionEndpoint(endpoint -> endpoint
                        .baseUri("/login/oauth2/code/google")
                )
                .userInfoEndpoint(userInfo -> userInfo
                        .oidcUserService(oidcUserService)
                )
                .successHandler(successHandler)
                .failureHandler(failureHandler);
    }

    private OAuth2AuthorizationRequestResolver googleAuthorizationRequests() {
        var delegate = new DefaultOAuth2AuthorizationRequestResolver(clients, "/api/oauth2/authorization");
        return new OAuth2AuthorizationRequestResolver() {
            @Override
            public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
                String path = request.getRequestURI().substring(request.getContextPath().length());
                // Let the access rules reject retired/unknown providers instead of raising a server error.
                return "/api/oauth2/authorization/google".equals(path) ? delegate.resolve(request) : null;
            }

            @Override
            public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String registrationId) {
                return "google".equals(registrationId) ? delegate.resolve(request, registrationId) : null;
            }
        };
    }
}
