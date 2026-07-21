package com.app.config;

import com.app.security.handler.RestAccessDeniedHandler;
import com.app.security.handler.RestAuthenticationEntryPoint;
import com.app.security.jwt.JwtAuthenticationFilter;
import com.app.security.oauth.OAuth2AuthenticationFailureHandler;
import com.app.security.oauth.OAuth2AuthenticationSuccessHandler;
import com.app.security.oauth.facebook.CustomOAuth2UserService;
import com.app.security.oauth.google.CustomOidcUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.regex.Pattern;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private static final Pattern PUBLIC_COURSE_PATH =
            Pattern.compile("^/api/courses(?:/\\d+)?$");

    private static final String[] PUBLIC_ENDPOINTS = {
            "/api/auth/**",
            "/api/oauth2/**",
            "/oauth2/**",
            "/login/oauth2/**",
            "/actuator/health",
            "/swagger-ui/**",
            "/v3/api-docs/**"
    };

    private static final String[] PAYMENT_CALLBACK_ENDPOINTS = {
            "/api/payments/momo-ipn",
            "/api/payments/payos-webhook",
            "/api/payments/zalopay-callback"
    };

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomOAuth2UserService oauth2UserService;
    private final CustomOidcUserService oidcUserService;
    private final OAuth2AuthenticationSuccessHandler successHandler;
    private final OAuth2AuthenticationFailureHandler failureHandler;
    private final RestAuthenticationEntryPoint authenticationEntryPoint;
    private final RestAccessDeniedHandler accessDeniedHandler;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(request ->
                                HttpMethod.GET.matches(request.getMethod())
                                        && PUBLIC_COURSE_PATH
                                        .matcher(request.getServletPath())
                                        .matches()
                        ).permitAll()
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/payments/vnpay-return"
                        ).permitAll()
                        .requestMatchers(
                                HttpMethod.POST,
                                PAYMENT_CALLBACK_ENDPOINTS
                        ).permitAll()
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth -> oauth
                        .authorizationEndpoint(endpoint -> endpoint
                                .baseUri("/api/oauth2/authorization")
                        )
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(oauth2UserService)
                                .oidcUserService(oidcUserService)
                        )
                        .successHandler(successHandler)
                        .failureHandler(failureHandler)
                )
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}