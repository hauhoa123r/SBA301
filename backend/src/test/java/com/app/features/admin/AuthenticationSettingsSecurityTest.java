package com.app.features.admin;

import com.app.config.SecurityConfig;
import com.app.features.admin.controller.AuthenticationSettingsController;
import com.app.features.auth.repository.UserRepository;
import com.app.features.auth.service.AuthenticationSettingsService;
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

@WebMvcTest(AuthenticationSettingsController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, RestAccessDeniedHandler.class, RestAuthenticationEntryPoint.class, SecurityErrorResponseWriter.class})
class AuthenticationSettingsSecurityTest {
    @Autowired MockMvc mvc;
    @MockitoBean AuthenticationSettingsService service;
    @MockitoBean UserRepository users;
    @MockitoBean JwtService jwt;
    @MockitoBean OAuth2SecurityConfigurer oauth;
    @MockitoBean ClientRegistrationRepository registrations;
    private static final String BODY = "{\"emailVerificationEnabled\":false,\"reason\":\"Disable registration email\"}";
    @Test void onlyAdminCanReadOrChangePolicy() throws Exception {
        mvc.perform(get("/api/admin/auth-settings")).andExpect(status().isUnauthorized());
        mvc.perform(put("/api/admin/auth-settings").contentType("application/json").content(BODY)).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/auth-settings").with(user("student").roles("STUDENT"))).andExpect(status().isForbidden());
        mvc.perform(put("/api/admin/auth-settings").with(user("student").roles("STUDENT")).contentType("application/json").content(BODY)).andExpect(status().isForbidden());
        verifyNoInteractions(service);
    }
    @Test void adminReadsCurrentPolicyAndCannotSubmitMissingFlagOrBlankReason() throws Exception {
        when(service.current()).thenReturn(new AuthenticationSettingsService.Policy(true));
        mvc.perform(get("/api/admin/auth-settings").with(user("admin").roles("ADMIN"))).andExpect(status().isOk())
            .andExpect(header().string("Cache-Control", "no-store")).andExpect(jsonPath("emailVerificationEnabled").value(true));
        mvc.perform(put("/api/admin/auth-settings").with(user("admin").roles("ADMIN")).contentType("application/json")
            .content("{\"reason\":\"Missing flag\"}")).andExpect(status().isBadRequest());
        mvc.perform(put("/api/admin/auth-settings").with(user("admin").roles("ADMIN")).contentType("application/json")
            .content("{\"emailVerificationEnabled\":false,\"reason\":\" \"}")).andExpect(status().isBadRequest());
        verify(service, never()).update(any(), any());
    }
    @Test void toggleUsesAuthenticatedAdminAndReturnsSavedValue() throws Exception {
        var admin = new UserEntity(); admin.setId(99L); var role = new RoleEntity(); role.setName("ADMIN"); admin.getRoles().add(role);
        when(users.findByIdWithRoles(99L)).thenReturn(Optional.of(admin));
        when(service.update(any(), any())).thenReturn(new AuthenticationSettingsService.Policy(false));
        var auth = new UsernamePasswordAuthenticationToken(admin, null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        mvc.perform(put("/api/admin/auth-settings").with(authentication(auth)).contentType("application/json").content(BODY)).andExpect(status().isOk())
            .andExpect(jsonPath("emailVerificationEnabled").value(false));
        verify(service).update(argThat(request -> !request.emailVerificationEnabled()), argThat(context -> context.actorId().equals(99L)));
    }
}
