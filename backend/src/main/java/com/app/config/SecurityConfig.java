package com.app.config;

import com.app.security.handler.RestAccessDeniedHandler;
import com.app.security.handler.RestAuthenticationEntryPoint;
import com.app.security.jwt.JwtAuthenticationFilter;
import com.app.security.oauth.config.OAuth2SecurityConfigurer;
import jakarta.servlet.http.HttpServletResponse;
import com.app.config.properties.CorsProperties;
import com.app.features.auth.service.RefreshSessionService;
import com.app.security.jwt.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.web.csrf.*;
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
    private static final String LOGOUT_FAILURE = SecurityConfig.class.getName() + ".logoutFailure";

    private static final String[] PUBLIC_AUTH_ENDPOINTS = {
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/refresh",
            "/api/auth/csrf",
            "/api/auth/forgot-password",
            "/api/auth/reset-password",
            "/api/auth/verify-token",
            "/api/auth/verify-email",
            "/api/auth/oauth/exchange",
            "/api/oauth2/authorization/google",
            "/login/oauth2/code/google"
    };

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RestAuthenticationEntryPoint authenticationEntryPoint;
    private final RestAccessDeniedHandler accessDeniedHandler;
    private final OAuth2SecurityConfigurer oauth2SecurityConfigurer;
    private final AuthenticationAttemptLimiter attempts;
    private final SecurityErrorResponseWriter responseWriter;
    private final CorsProperties corsProperties;
    private final RefreshSessionService refreshSessions;
    private final RefreshCookie refreshCookie;
    @Value("${app.auth.cookie-secure:true}") private boolean cookieSecure;
    @Value("${app.auth.cookie-same-site:Lax}") private String cookieSameSite;

    @Bean
    static AuthenticationAttemptLimiter authenticationAttemptLimiter() {
        return new AuthenticationAttemptLimiter();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        CookieCsrfTokenRepository csrfRepository = new CookieCsrfTokenRepository();
        csrfRepository.setCookiePath(RefreshCookie.PATH);
        csrfRepository.setCookieCustomizer(cookie -> cookie.httpOnly(true).secure(cookieSecure).sameSite(cookieSameSite));
        http.cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.csrfTokenRepository(csrfRepository)
                        .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
                        .requireCsrfProtectionMatcher(new AuthCookieRequestMatcher()))
                .addFilterBefore(new AuthOriginFilter(corsProperties), CsrfFilter.class)
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
                        .addLogoutHandler((request, response, authentication) -> {
                            try {
                                refreshSessions.revoke(refreshCookie.read(request));
                                refreshCookie.clear(response);
                            } catch (RuntimeException ex) {
                                // Preserve the cookie for retry. An /error dispatch would mask this as 401.
                                request.setAttribute(LOGOUT_FAILURE, Boolean.TRUE);
                            }
                        })
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .deleteCookies("JSESSIONID")
                        .logoutSuccessHandler((request, response, authentication) -> {
                            if (Boolean.TRUE.equals(request.getAttribute(LOGOUT_FAILURE))) {
                                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                                response.setContentType("application/json");
                                response.getWriter().write("{\"status\":500,\"message\":\"Server logout could not be confirmed. Please retry.\"}");
                            } else response.setStatus(HttpServletResponse.SC_NO_CONTENT);
                        })
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Internal metrics; Nginx exposes only health and blocks other actuator paths.
                        .requestMatchers(HttpMethod.GET, "/actuator/health", "/actuator/prometheus").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/subscriptions/plans").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/feedback/current").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/contact").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/feedback/current/participation").hasAnyRole("STUDENT", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/feedback/current/start", "/api/feedback/current/submissions").hasAnyRole("STUDENT", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/courses", "/api/courses/{id}").permitAll()
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/payments/payos-webhook"
                        ).permitAll()
                        .requestMatchers(PUBLIC_AUTH_ENDPOINTS).permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/notifications/recommendation", "/api/learning/streak").hasRole("STUDENT")
                        .requestMatchers(HttpMethod.GET, "/api/notifications").hasAnyRole("STUDENT", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/notifications/read", "/api/notifications/*/read").hasAnyRole("STUDENT", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/notifications/daily-study").hasRole("STUDENT")
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
