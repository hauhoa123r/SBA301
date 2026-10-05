package com.app.features.admin;

import com.app.config.SecurityConfig;
import com.app.features.admin.controller.DashboardController;
import com.app.features.admin.dto.DashboardResponse.CoursePage;
import com.app.features.admin.service.DashboardService;
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

@WebMvcTest(DashboardController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, RestAccessDeniedHandler.class,
        RestAuthenticationEntryPoint.class, SecurityErrorResponseWriter.class})
class DashboardSecurityTest {
    @Autowired MockMvc mvc;
    @MockitoBean DashboardService service;
    @MockitoBean JwtService jwtService;
    @MockitoBean UserRepository users;
    @MockitoBean OAuth2SecurityConfigurer oauthConfigurer;
    @MockitoBean ClientRegistrationRepository clientRegistrations;

    @Test
    void anonymousCannotReadEitherEndpoint() throws Exception {
        mvc.perform(get("/api/admin/dashboard")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/dashboard/courses")).andExpect(status().isUnauthorized());
        verifyNoInteractions(service);
    }

    @Test
    void nonAdminRolesCannotReadEitherEndpoint() throws Exception {
        for (String role : List.of("STUDENT", "TEACHER", "MODERATOR")) {
            mvc.perform(get("/api/admin/dashboard").with(user("other").roles(role))).andExpect(status().isForbidden());
            mvc.perform(get("/api/admin/dashboard/courses").with(user("other").roles(role))).andExpect(status().isForbidden());
        }
        verifyNoInteractions(service);
    }

    @Test
    void adminCanReadDashboardWithoutReceivingStudentPermissions() throws Exception {
        when(service.courses("", "", 0, 10)).thenReturn(new CoursePage(List.of(), 0, 0, 10, 0));
        mvc.perform(get("/api/admin/dashboard").with(user("admin").roles("ADMIN"))).andExpect(status().isOk());
        mvc.perform(get("/api/admin/dashboard/courses").with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk()).andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(jsonPath("totalElements").value(0));
        mvc.perform(get("/api/learning/stats").with(user("admin").roles("ADMIN"))).andExpect(status().isForbidden());
    }
}
