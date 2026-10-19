package com.app.features.feedback;

import com.app.config.SecurityConfig;
import com.app.features.feedback.controller.*;
import com.app.features.feedback.dto.FeedbackDto.*;
import com.app.features.feedback.service.FeedbackService;
import com.app.features.auth.repository.UserRepository;
import com.app.features.model.UserEntity;
import com.app.features.model.RoleEntity;
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
import java.time.Instant;
import java.util.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest({FeedbackController.class, AdminFeedbackController.class})
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, RestAccessDeniedHandler.class, RestAuthenticationEntryPoint.class, SecurityErrorResponseWriter.class})
class FeedbackSecurityTest {
    @MockitoBean com.app.config.properties.CorsProperties corsProperties;
    @MockitoBean com.app.features.auth.service.RefreshSessionService refreshSessions;
    @MockitoBean com.app.security.jwt.RefreshCookie refreshCookie;
    @Autowired MockMvc mvc;
    @MockitoBean FeedbackService service;
    @MockitoBean UserRepository users;
    @MockitoBean JwtService jwt;
    @MockitoBean OAuth2SecurityConfigurer oauth;
    @MockitoBean ClientRegistrationRepository registrations;
    @Test void publicApiOnlyExposesCurrentFormAndNoUserListOrPersonalAnswers() throws Exception {
        mvc.perform(get("/api/feedback/current")).andExpect(status().isOk()).andExpect(header().string("Cache-Control", "no-store"));
        verify(service).current(null);
        mvc.perform(get("/api/feedback")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/feedback/1/statistics")).andExpect(status().isUnauthorized());
    }
    @Test void guestsCannotParticipateAndStudentsCannotAccessAdminDataOrMutateForms() throws Exception {
        for (String path : List.of("/api/feedback/current/start", "/api/feedback/current/submissions", "/api/admin/feedback", "/api/admin/feedback/1/state"))
            mvc.perform(post(path).contentType("application/json").content("{}")).andExpect(status().isUnauthorized());
        for (String path : List.of("/api/admin/feedback", "/api/admin/feedback/1", "/api/admin/feedback/1/statistics", "/api/admin/feedback/1/questions/2/text-answers"))
            mvc.perform(get(path).with(user("student").roles("STUDENT"))).andExpect(status().isForbidden());
        mvc.perform(post("/api/admin/feedback").with(user("student").roles("STUDENT")).contentType("application/json").content("{}")).andExpect(status().isForbidden());
        mvc.perform(post("/api/admin/feedback/1/state").with(user("student").roles("STUDENT")).contentType("application/json").content("{}")).andExpect(status().isForbidden());
        verifyNoInteractions(service);
    }
    @Test void submissionUsesAuthenticatedUserInsteadOfClientSuppliedUserId() throws Exception {
        var u = new UserEntity(); u.setId(7L);
        var role = new RoleEntity(); role.setName("STUDENT"); u.getRoles().add(role);
        when(users.findByIdWithRoles(7L)).thenReturn(Optional.of(u));
        var auth = new UsernamePasswordAuthenticationToken(u, null, List.of(new SimpleGrantedAuthority("ROLE_STUDENT")));
        when(service.submit(any(), eq(7L))).thenReturn(new Receipt(33L, Instant.now()));
        mvc.perform(post("/api/feedback/current/submissions").with(authentication(auth)).contentType("application/json")
            .content("{\"formId\":1,\"revision\":2,\"userId\":999,\"answers\":[{\"questionId\":3,\"text\":\"Góp ý\",\"optionIds\":[]}]}"))
            .andExpect(status().isCreated()).andExpect(jsonPath("submissionId").value(33));
        verify(service).submit(argThat(body -> body.formId() == 1 && body.revision() == 2), eq(7L));
    }
    @Test void malformedPayloadCannotReachSubmissionService() throws Exception {
        mvc.perform(post("/api/feedback/current/submissions").with(user("student").roles("STUDENT")).contentType("application/json")
            .content("{\"formId\":1,\"revision\":0,\"answers\":[null]}"))
            .andExpect(status().isBadRequest()); verifyNoInteractions(service);
    }
    @Test void adminCanReadHistoryWithNoStore() throws Exception {
        when(service.list(0)).thenReturn(new FormPage(List.of(), 0, 0, 0));
        mvc.perform(get("/api/admin/feedback").with(user("admin").roles("ADMIN"))).andExpect(status().isOk())
            .andExpect(header().string("Cache-Control", "no-store"));
    }
}
