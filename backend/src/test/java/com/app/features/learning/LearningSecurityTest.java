package com.app.features.learning;

import com.app.config.SecurityConfig;
import com.app.features.admin.controller.AssignmentReviewController;
import com.app.features.admin.service.AssignmentReviewService;
import com.app.features.auth.repository.UserRepository;
import com.app.features.learning.controller.LearningController;
import com.app.features.learning.dto.response.CourseProgressResponse;
import com.app.features.learning.service.*;
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
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest({LearningController.class, AssignmentReviewController.class})
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, RestAccessDeniedHandler.class, RestAuthenticationEntryPoint.class, SecurityErrorResponseWriter.class})
class LearningSecurityTest {
    @Autowired MockMvc mvc;
    @MockitoBean ILearningService service;
    @MockitoBean ILearningProgressService progress;
    @MockitoBean LearningActivityService activities;
    @MockitoBean AssignmentReviewService reviews;
    @MockitoBean JwtService jwtService;
    @MockitoBean UserRepository users;
    @MockitoBean OAuth2SecurityConfigurer oauthConfigurer;
    @MockitoBean ClientRegistrationRepository registrations;

    @Test void anonymousCannotReadOrWriteLearning() throws Exception {
        mvc.perform(get("/api/learning/courses/1/progress")).andExpect(status().isUnauthorized());
        mvc.perform(put("/api/learning/courses/1/lessons/2/progress").contentType("application/json").content("{\"completed\":true}")).andExpect(status().isUnauthorized());
        verifyNoInteractions(progress, activities);
    }
    @Test void studentCannotReadOrGradeOtherStudentsSubmissions() throws Exception {
        mvc.perform(get("/api/admin/assignments/submissions").with(user("student").roles("STUDENT"))).andExpect(status().isForbidden());
        mvc.perform(put("/api/admin/assignments/submissions/1/grade").with(user("student").roles("STUDENT")).contentType("application/json")
            .content("{\"status\":\"GRADED\",\"score\":100}")).andExpect(status().isForbidden());
        verifyNoInteractions(reviews);
    }
    @Test void progressUsesAuthenticatedStudentAndAcceptsUndo() throws Exception {
        var principal = new UserEntity(); principal.setId(7L);
        var role = new com.app.features.model.RoleEntity(); role.setName("STUDENT"); principal.getRoles().add(role);
        when(users.findByIdWithRoles(7L)).thenReturn(java.util.Optional.of(principal));
        var auth = UsernamePasswordAuthenticationToken.authenticated(principal, null, List.of(new SimpleGrantedAuthority("ROLE_STUDENT")));
        when(progress.updateLessonProgress(eq(7L), eq(1L), eq(2L), any())).thenReturn(new CourseProgressResponse());
        mvc.perform(put("/api/learning/courses/1/lessons/2/progress").with(authentication(auth)).contentType("application/json")
            .content("{\"completed\":false,\"userId\":999}")).andExpect(status().isOk());
        verify(progress).updateLessonProgress(eq(7L), eq(1L), eq(2L), argThat(request -> !request.completed()));
    }
    @Test void invalidPlaybackIsRejectedBeforeSaving() throws Exception {
        mvc.perform(put("/api/learning/courses/1/lessons/2/playback").with(user("student").roles("STUDENT")).contentType("application/json")
            .content("{\"positionSeconds\":-1,\"watchedSeconds\":99}")).andExpect(status().isBadRequest());
        verifyNoInteractions(activities);
    }
    @Test void adminCanReviewButCannotUseStudentLearningEndpoints() throws Exception {
        when(reviews.list("", 0)).thenReturn(new AssignmentReviewService.SubmissionPage(List.of(), 0, 0, 0));
        mvc.perform(get("/api/admin/assignments/submissions").with(user("admin").roles("ADMIN"))).andExpect(status().isOk());
        mvc.perform(get("/api/learning/activity").with(user("admin").roles("ADMIN"))).andExpect(status().isForbidden());
    }
}
