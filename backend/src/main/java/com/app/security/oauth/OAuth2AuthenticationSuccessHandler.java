package com.app.security.oauth;

import com.app.features.oauth.service.OAuthAuthorizationCodeService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    private final OAuthAuthorizationCodeService codeService;
    private final String frontendRedirectUri;

    public OAuth2AuthenticationSuccessHandler(OAuthAuthorizationCodeService codeService,
            @Value("${app.oauth2.frontend-redirect-uri}") String frontendRedirectUri) {
        this.codeService = codeService;
        this.frontendRedirectUri = frontendRedirectUri;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        CustomOAuth2User principal = (CustomOAuth2User) authentication.getPrincipal();
        String code = codeService.create(principal.getUser());
        String target = UriComponentsBuilder.fromUriString(frontendRedirectUri).queryParam("code", code)
                .build().encode().toUriString();
        response.sendRedirect(target);
    }
}

