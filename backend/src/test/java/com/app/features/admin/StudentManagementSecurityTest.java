package com.app.features.admin;

import com.app.config.SecurityConfig;
import com.app.features.admin.controller.StudentManagementController;
import com.app.features.admin.dto.StudentManagement.*;
import com.app.features.admin.service.StudentManagementService;
import com.app.features.auth.repository.UserRepository;
import com.app.features.model.*;
import com.app.security.handler.*;
import com.app.security.jwt.*;
import com.app.security.oauth.config.OAuth2SecurityConfigurer;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.util.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(StudentManagementController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, RestAccessDeniedHandler.class, RestAuthenticationEntryPoint.class, SecurityErrorResponseWriter.class})
class StudentManagementSecurityTest {
    @Autowired MockMvc mvc;
    @MockitoBean StudentManagementService service;
    @MockitoBean JwtService jwtService;
    @MockitoBean UserRepository users;
    @MockitoBean OAuth2SecurityConfigurer oauthConfigurer;
    @MockitoBean ClientRegistrationRepository registrations;
    @Test void anonymousAndStudentsCannotReadOrWriteManagement() throws Exception {
        for (String path : List.of("/api/admin/students", "/api/admin/students/1", "/api/admin/subscription-plans")) {
            mvc.perform(get(path)).andExpect(status().isUnauthorized());
            mvc.perform(get(path).with(user("student").roles("STUDENT"))).andExpect(status().isForbidden());
        }
        mvc.perform(post("/api/admin/students/1/subscription/grant").with(user("student").roles("STUDENT")).contentType("application/json")
            .content("{\"planCode\":\"STANDARD\",\"days\":30,\"mode\":\"EXTEND\",\"reason\":\"Student escalation\"}")).andExpect(status().isForbidden());
        verifyNoInteractions(service);
    }
    @Test void adminReadsPaginatedStudentsWithNoStore() throws Exception {
        when(service.list("", "", "", 0)).thenReturn(new StudentPage(List.of(), 0, 0, 0));
        mvc.perform(get("/api/admin/students").with(user("admin").roles("ADMIN"))).andExpect(status().isOk())
            .andExpect(header().string("Cache-Control", "no-store")).andExpect(jsonPath("totalElements").value(0));
    }
    @Test void validationRejectsInvalidStatusDaysAndMissingReason() throws Exception {
        mvc.perform(patch("/api/admin/students/1/status").with(user("admin").roles("ADMIN")).contentType("application/json")
            .content("{\"status\":\"DELETED\",\"reason\":\"No deletion\"}")).andExpect(status().isBadRequest());
        mvc.perform(post("/api/admin/students/1/subscription/grant").with(user("admin").roles("ADMIN")).contentType("application/json")
            .content("{\"planCode\":\"STANDARD\",\"days\":0,\"mode\":\"EXTEND\",\"reason\":\"Test\"}")).andExpect(status().isBadRequest());
        mvc.perform(post("/api/admin/students/1/subscription/revoke").with(user("admin").roles("ADMIN")).contentType("application/json")
            .content("{\"reason\":\" \"}")).andExpect(status().isBadRequest());
        mvc.perform(post("/api/admin/subscription-plans").with(user("admin").roles("ADMIN")).contentType("application/json")
            .content("{\"code\":\"BAD CODE\",\"name\":\"Plan\",\"price\":-1,\"durationDays\":0,\"active\":true,\"reason\":\"Test\"}")).andExpect(status().isBadRequest());
        verifyNoInteractions(service);
    }
    @Test void mutationAuditUsesAuthenticatedAdminId() throws Exception {
        var admin = new UserEntity(); admin.setId(99L); var role = new RoleEntity(); role.setName("ADMIN"); admin.getRoles().add(role);
        when(users.findByIdWithRoles(99L)).thenReturn(Optional.of(admin));
        var principal = new UsernamePasswordAuthenticationToken(admin, null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        mvc.perform(post("/api/admin/students/1/subscription/grant").with(authentication(principal)).contentType("application/json")
            .content("{\"planCode\":\"STANDARD\",\"days\":30,\"mode\":\"EXTEND\",\"reason\":\"Scholarship\"}")).andExpect(status().isOk());
        verify(service).grant(eq(1L), any(GrantRequest.class), argThat(context -> context.actorId().equals(99L)));
    }
}
