package com.app.features.admin;

import com.app.config.SecurityConfig;
import com.app.features.admin.controller.ActivityLabController;
import com.app.features.admin.controller.LearningAnalyticsController;
import com.app.features.auth.repository.UserRepository;
import com.app.security.handler.RestAccessDeniedHandler;
import com.app.security.handler.RestAuthenticationEntryPoint;
import com.app.security.handler.SecurityErrorResponseWriter;
import com.app.security.jwt.JwtAuthenticationFilter;
import com.app.security.jwt.JwtService;
import com.app.security.oauth.config.OAuth2SecurityConfigurer;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest({ActivityLabController.class, LearningAnalyticsController.class})
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, RestAccessDeniedHandler.class,
        RestAuthenticationEntryPoint.class, SecurityErrorResponseWriter.class})
class LearningAnalyticsSecurityTest {
    @MockitoBean com.app.config.properties.CorsProperties corsProperties;
    @MockitoBean com.app.features.auth.service.RefreshSessionService refreshSessions;
    @MockitoBean com.app.security.jwt.RefreshCookie refreshCookie;
    @Autowired MockMvc mvc;
    @MockitoBean com.app.features.admin.service.ActivityLabService service;
    @MockitoBean com.app.features.admin.service.LearningAnalyticsService analytics;
    @MockitoBean JwtService jwtService;
    @MockitoBean UserRepository users;
    @MockitoBean OAuth2SecurityConfigurer oauthConfigurer;
    @MockitoBean ClientRegistrationRepository clientRegistrations;

    @Test void anonymousAndStudentsCannotUseHiddenEndpoints() throws Exception {
        for (String path : List.of("/api/admin/activity-lab", "/api/admin/activity-lab/users/1", "/api/admin/activity-lab/users/1/feedback", "/api/admin/learning-analytics")) {
            mvc.perform(get(path)).andExpect(status().isUnauthorized());
            for (String role : List.of("STUDENT", "TEACHER", "MODERATOR"))
                mvc.perform(get(path).with(user("other").roles(role))).andExpect(status().isForbidden());
        }
        for (String path : List.of("/api/admin/activity-lab/users", "/api/admin/activity-lab/users/1/run", "/api/admin/activity-lab/users/1/subscription", "/api/admin/activity-lab/users/1/feedback"))
            mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(path).with(user("student").roles("STUDENT"))
                .contentType("application/json").content("{}")).andExpect(status().isForbidden());
        for (String path : List.of("/api/admin/activity-lab/users/1/rule", "/api/admin/learning-analytics/settings"))
            mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put(path).with(user("student").roles("STUDENT"))
                .contentType("application/json").content("{}")).andExpect(status().isForbidden());
        verifyNoInteractions(service, analytics);
    }
    @Test void adminCanReadAndResponsesAreNotCached() throws Exception {
        when(service.overview("", 0)).thenReturn(java.util.Map.of("enabled", false));
        mvc.perform(get("/api/admin/activity-lab").with(user("admin").roles("ADMIN")))
            .andExpect(status().isOk()).andExpect(header().string("Cache-Control", "no-store"));
    }
}
