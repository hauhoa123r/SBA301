package com.app.security.oauth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@Slf4j
public class OAuth2AuthenticationFailureHandler implements AuthenticationFailureHandler {
    private final String frontendRedirectUri;

    public OAuth2AuthenticationFailureHandler(@Value("${app.oauth2.frontend-redirect-uri}") String frontendRedirectUri) {
        this.frontendRedirectUri = frontendRedirectUri;
    }

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException {
        String provider = request.getRequestURI().replaceFirst(".*/", "");
        String error = exception instanceof OAuth2AuthenticationException oauth
                ? oauth.getError().getErrorCode() : "oauth_authentication_failed";
        log.error("OAuth2 authentication failed, provider={}, error={}", provider, error);
        String target = UriComponentsBuilder.fromUriString(frontendRedirectUri).queryParam("error", error)
                .build().encode().toUriString();
        response.sendRedirect(target);
    }
}
