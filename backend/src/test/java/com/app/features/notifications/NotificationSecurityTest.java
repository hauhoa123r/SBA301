package com.app.features.notifications;

import com.app.config.SecurityConfig;
import com.app.features.auth.repository.UserRepository;
import com.app.features.model.UserEntity;
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
import java.util.List;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(NotificationController.class)
@Import({SecurityConfig.class,JwtAuthenticationFilter.class,RestAccessDeniedHandler.class,RestAuthenticationEntryPoint.class,SecurityErrorResponseWriter.class})
class NotificationSecurityTest {
    @Autowired MockMvc mvc;
    @MockitoBean NotificationService service;
    @MockitoBean RecommendationService recommendations;
    @MockitoBean com.app.config.properties.CorsProperties corsProperties;
    @MockitoBean com.app.features.auth.service.RefreshSessionService sessions;
    @MockitoBean RefreshCookie cookie;
    @MockitoBean UserRepository users;
    @MockitoBean JwtService jwt;
    @MockitoBean OAuth2SecurityConfigurer oauth;
    @MockitoBean ClientRegistrationRepository registrations;
    private UsernamePasswordAuthenticationToken student() {
        var user=new UserEntity();user.setId(7L);
        var role=new com.app.features.model.RoleEntity();role.setName("STUDENT");user.getRoles().add(role);
        when(users.findByIdWithRoles(7L)).thenReturn(java.util.Optional.of(user));
        return UsernamePasswordAuthenticationToken.authenticated(user,null,List.of(new SimpleGrantedAuthority("ROLE_STUDENT")));
    }
    @Test void guestsCannotReadMarkOrGenerateNotifications() throws Exception {
        mvc.perform(get("/api/notifications")).andExpect(status().isUnauthorized());
        mvc.perform(put("/api/notifications/1/read")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/notifications/daily-study")).andExpect(status().isUnauthorized());
        verifyNoInteractions(service);
    }
    @Test void recipientComesFromPrincipalAndReadOperationsAreNotPubliclyCached() throws Exception {
        when(service.inbox(7L,0)).thenReturn(new NotificationService.Inbox(List.of(),0,0,0));
        mvc.perform(get("/api/notifications?userId=999").with(authentication(student())))
            .andExpect(status().isOk()).andExpect(header().string("Cache-Control","no-store"));
        verify(service).inbox(7L,0);
        mvc.perform(put("/api/notifications/123/read").with(authentication(student())))
            .andExpect(status().isNoContent());verify(service).read(7L,123L);
    }
    @Test void dailyRecommendationIsStudentOnlyAndUsesCurrentUser() throws Exception {
        mvc.perform(post("/api/notifications/daily-study").with(user("admin").roles("ADMIN"))).andExpect(status().isForbidden());
        when(service.daily(7L)).thenReturn(new NotificationService.Daily(null,false));
        mvc.perform(post("/api/notifications/daily-study").with(authentication(student())))
            .andExpect(status().isOk()).andExpect(header().string("Cache-Control","no-store"));verify(service).daily(7L);
    }
}
