package com.app.config;

import com.app.security.handler.RestAccessDeniedHandler;
import com.app.security.handler.RestAuthenticationEntryPoint;
import com.app.security.jwt.JwtAuthenticationFilter;
import com.app.security.oauth.config.OAuth2SecurityConfigurer;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.context.RequestAttributeSecurityContextRepository;
import com.app.security.ratelimit.AuthenticationAttemptLimiter;
import com.app.security.ratelimit.AuthenticationRateLimitFilter;
import com.app.security.handler.SecurityErrorResponseWriter;


@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private static final String[] PUBLIC_AUTH_ENDPOINTS = {
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/refresh",
            "/api/auth/forgot-password",
            "/api/auth/reset-password",
            "/api/auth/verify-token",
            "/api/auth/verify-email",
            "/api/auth/oauth/exchange",
            "/api/oauth2/authorization/**",
            "/login/oauth2/code/**"
    };

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RestAuthenticationEntryPoint authenticationEntryPoint;
    private final RestAccessDeniedHandler accessDeniedHandler;
    private final OAuth2SecurityConfigurer oauth2SecurityConfigurer;
    private final AuthenticationAttemptLimiter attempts;
    private final SecurityErrorResponseWriter responseWriter;

    @Bean
    static AuthenticationAttemptLimiter authenticationAttemptLimiter() {
        return new AuthenticationAttemptLimiter();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                // OAuth still keeps its authorization request in HttpSession. API identity is request-scoped.
                .securityContext(context -> context.securityContextRepository(new RequestAttributeSecurityContextRepository()))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                )
                .logout(logout -> logout
                        .logoutRequestMatcher(request -> HttpMethod.POST.matches(request.getMethod())
                                && "/api/auth/logout".equals(request.getRequestURI().substring(request.getContextPath().length())))
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .deleteCookies("JSESSIONID")
                        .logoutSuccessHandler((request, response, authentication) ->
                                response.setStatus(HttpServletResponse.SC_NO_CONTENT)
                        )
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Internal metrics; Nginx exposes only health and blocks other actuator paths.
                        .requestMatchers(HttpMethod.GET, "/actuator/health", "/actuator/prometheus").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/subscriptions/plans").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/feedback/current").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/feedback/current/participation").hasAnyRole("STUDENT", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/feedback/current/start", "/api/feedback/current/submissions").hasAnyRole("STUDENT", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/courses", "/api/courses/{id}").permitAll()
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/payments/payos-webhook"
                        ).permitAll()
                        .requestMatchers(PUBLIC_AUTH_ENDPOINTS).permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/auth/me").hasAnyRole("STUDENT", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/users/*", "/api/users/*/orders",
                                "/api/learning/activity", "/api/learning/stats", "/api/learning/courses/*",
                                "/api/learning/courses/*/progress", "/api/subscriptions/me", "/api/categories",
                                "/api/tags", "/api/coupon/*").hasRole("STUDENT")
                        .requestMatchers(HttpMethod.PATCH, "/api/users/*").hasRole("STUDENT")
                        .requestMatchers(HttpMethod.PUT, "/api/learning/courses/*/lessons/*/progress",
                                "/api/learning/courses/*/lessons/*/playback",
                                "/api/learning/courses/*/assignments/*/submission").hasRole("STUDENT")
                        .requestMatchers(HttpMethod.POST, "/api/learning/courses/*/quizzes/*/submissions",
                                "/api/payments/create", "/api/payments/invoices/*/sync",
                                "/api/subscriptions/trial").hasRole("STUDENT")
                        .anyRequest().denyAll()
                )
                .oauth2Login(oauth2SecurityConfigurer::configure)
                .addFilterBefore(new AuthenticationRateLimitFilter(attempts, responseWriter),
                        org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestRedirectFilter.class)
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}
