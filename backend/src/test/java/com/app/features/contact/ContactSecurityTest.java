package com.app.features.contact;

import com.app.config.SecurityConfig;
import com.app.features.contact.controller.*;
import com.app.features.contact.dto.ContactDto.*;
import com.app.features.contact.dto.ContactCategory;
import com.app.features.contact.model.ContactMessage.Status;
import com.app.features.contact.service.ContactService;
import com.app.features.auth.repository.UserRepository;
import com.app.security.handler.*;
import com.app.security.jwt.*;
import com.app.security.oauth.config.OAuth2SecurityConfigurer;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest({ContactController.class, AdminContactController.class})
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, RestAccessDeniedHandler.class, RestAuthenticationEntryPoint.class, SecurityErrorResponseWriter.class})
class ContactSecurityTest {
    private static final String BODY = "{\"fullName\":\"Người dùng\",\"email\":\"user@example.test\",\"topic\":\"Góp ý\",\"message\":\"Cần hỗ trợ\"}";
    @Autowired MockMvc mvc;
    @MockitoBean ContactService service;
    @MockitoBean com.app.features.contact.service.ContactReplyService replies;
    @MockitoBean com.app.config.properties.CorsProperties corsProperties;
    @MockitoBean com.app.features.auth.service.RefreshSessionService refreshSessions;
    @MockitoBean RefreshCookie refreshCookie;
    @MockitoBean UserRepository users;
    @MockitoBean JwtService jwt;
    @MockitoBean OAuth2SecurityConfigurer oauth;
    @MockitoBean ClientRegistrationRepository registrations;

    @Test void guestCanSendButReceiptDoesNotExposePersonalData() throws Exception {
        when(service.submit(any())).thenReturn(new Receipt(123L));
        mvc.perform(post("/api/contact").contentType("application/json").content(BODY))
            .andExpect(status().isCreated()).andExpect(header().string("Cache-Control", "no-store"))
            .andExpect(content().json("{\"id\":123}", true));
        verify(service).submit(argThat(body -> body.email().equals("user@example.test")));
    }
    @Test void feedbackOwnershipComesFromAuthenticatedPrincipalNotSubmittedEmail() throws Exception {
        var principal=new com.app.features.model.UserEntity();principal.setId(7L);
        var role=new com.app.features.model.RoleEntity();role.setName("STUDENT");principal.getRoles().add(role);
        when(users.findByIdWithRoles(7L)).thenReturn(java.util.Optional.of(principal));
        var auth=org.springframework.security.authentication.UsernamePasswordAuthenticationToken.authenticated(principal,null,
            List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_STUDENT")));
        when(service.submit(any(),eq(7L))).thenReturn(new Receipt(1L));
        mvc.perform(post("/api/contact").with(authentication(auth)).contentType("application/json").content(BODY))
            .andExpect(status().isCreated());verify(service).submit(any(),eq(7L));
    }
    @Test void onlyAdminCanReplyAndReplyContentMustBeNonblank() throws Exception {
        mvc.perform(put("/api/admin/contact-messages/1/reply").with(user("student").roles("STUDENT"))
            .contentType("application/json").content("{\"text\":\"Hello\"}")).andExpect(status().isForbidden());
        var principal=new com.app.features.model.UserEntity();principal.setId(9L);
        var role=new com.app.features.model.RoleEntity();role.setName("ADMIN");principal.getRoles().add(role);
        when(users.findByIdWithRoles(9L)).thenReturn(java.util.Optional.of(principal));
        var auth=org.springframework.security.authentication.UsernamePasswordAuthenticationToken.authenticated(principal,null,
            List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ADMIN")));
        mvc.perform(put("/api/admin/contact-messages/1/reply").with(authentication(auth)).contentType("application/json").content("{\"text\":\" \"}"))
            .andExpect(status().isBadRequest());verifyNoInteractions(replies);
        mvc.perform(put("/api/admin/contact-messages/1/reply").with(authentication(auth)).contentType("application/json").content("{\"text\":\"Hello\"}"))
            .andExpect(status().isOk());verify(replies).reply(1L,9L,"Hello");
    }
    @Test void privateInboxAndStatusChangesAreAdminOnly() throws Exception {
        mvc.perform(get("/api/admin/contact-messages")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/contact-messages/statistics")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/contact-messages/statistics").with(user("student").roles("STUDENT"))).andExpect(status().isForbidden());
        mvc.perform(get("/api/contact")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/contact-messages").with(user("student").roles("STUDENT"))).andExpect(status().isForbidden());
        mvc.perform(patch("/api/admin/contact-messages/1/status").contentType("application/json").content("{\"status\":\"RESOLVED\"}"))
            .andExpect(status().isUnauthorized());
        mvc.perform(patch("/api/admin/contact-messages/1/status").with(user("student").roles("STUDENT"))
            .contentType("application/json").content("{\"status\":\"RESOLVED\"}")).andExpect(status().isForbidden());
        verifyNoInteractions(service);
    }
    @Test void invalidOrOversizedInputNeverReachesStorage() throws Exception {
        for (String body : List.of("{}", BODY.replace("user@example.test", "invalid-email"),
                BODY.replace("Cần hỗ trợ", " "), BODY.replace("Cần hỗ trợ", "x".repeat(5001)),
                BODY.replace("Người dùng", "x".repeat(101)))) {
            mvc.perform(post("/api/contact").contentType("application/json").content(body)).andExpect(status().isBadRequest());
        }
        verifyNoInteractions(service);
    }
    @Test void repeatedGuestRequestsAreThrottledBeforeWriting() throws Exception {
        when(service.submit(any())).thenReturn(new Receipt(1L));
        for (int i = 0; i < 5; i++) mvc.perform(post("/api/contact").with(request -> { request.setRemoteAddr("192.0.2.20"); return request; })
            .contentType("application/json").content(BODY)).andExpect(status().isCreated());
        mvc.perform(post("/api/contact").with(request -> { request.setRemoteAddr("192.0.2.20"); return request; })
            .contentType("application/json").content(BODY)).andExpect(status().isTooManyRequests())
            .andExpect(header().string("Retry-After", "600"));
        verify(service, times(5)).submit(any());
    }
    @Test void adminCanFilterAndUpdateAndResponsesCannotBeCached() throws Exception {
        when(service.inbox(Status.NEW, null, 0)).thenReturn(new Inbox(List.of(), 0, 0, 0, 0));
        mvc.perform(get("/api/admin/contact-messages?status=NEW").with(user("admin").roles("ADMIN")))
            .andExpect(status().isOk()).andExpect(header().string("Cache-Control", "no-store"));
        mvc.perform(patch("/api/admin/contact-messages/1/status").with(user("admin").roles("ADMIN"))
            .contentType("application/json").content("{\"status\":\"RESOLVED\"}"))
            .andExpect(status().isOk()).andExpect(header().string("Cache-Control", "no-store"));
        verify(service).updateStatus(1L, Status.RESOLVED);
        mvc.perform(patch("/api/admin/contact-messages/1/status").with(user("admin").roles("ADMIN"))
            .contentType("application/json").content("{\"status\":\"INVALID\"}")).andExpect(status().isBadRequest());
        mvc.perform(patch("/api/admin/contact-messages/1/status").with(user("admin").roles("ADMIN"))
            .contentType("application/json").content("{}")).andExpect(status().isBadRequest());
    }
    @Test void statisticsAndTopicFiltersUseAdminOnlyApiWithoutSurveyData() throws Exception {
        when(service.statistics()).thenReturn(new Statistics(30, 12, 18, List.of()));
        mvc.perform(get("/api/admin/contact-messages/statistics").with(user("admin").roles("ADMIN")))
            .andExpect(status().isOk()).andExpect(header().string("Cache-Control", "no-store"))
            .andExpect(jsonPath("totalReceived").value(30)).andExpect(jsonPath("unreadCount").value(12)).andExpect(jsonPath("resolvedCount").value(18));
        mvc.perform(get("/api/admin/contact-messages?category=TECHNICAL&status=NEW").with(user("admin").roles("ADMIN"))).andExpect(status().isOk());
        verify(service).inbox(Status.NEW, ContactCategory.TECHNICAL, 0);
        mvc.perform(get("/api/admin/contact-messages?category=INVALID").with(user("admin").roles("ADMIN"))).andExpect(status().isBadRequest());
    }
}
