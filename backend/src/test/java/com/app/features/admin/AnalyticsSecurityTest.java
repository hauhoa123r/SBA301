package com.app.features.admin;

import com.app.config.SecurityConfig;
import com.app.features.admin.controller.*;
import com.app.features.admin.service.*;
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
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest({RegistrationAnalyticsController.class,PaymentAnalyticsController.class,DashboardController.class,StudentManagementController.class})
@Import({SecurityConfig.class,JwtAuthenticationFilter.class,RestAccessDeniedHandler.class,RestAuthenticationEntryPoint.class,SecurityErrorResponseWriter.class})
class AnalyticsSecurityTest {
    @Autowired MockMvc mvc;
    @MockitoBean RegistrationAnalyticsService registrations;
    @MockitoBean PaymentAnalyticsService payments;
    @MockitoBean CoursePriceService prices;
    @MockitoBean DashboardService dashboard;
    @MockitoBean StudentManagementService students;
    @MockitoBean com.app.config.properties.CorsProperties corsProperties;
    @MockitoBean com.app.features.auth.service.RefreshSessionService refreshSessions;
    @MockitoBean RefreshCookie refreshCookie;
    @MockitoBean JwtService jwt;
    @MockitoBean UserRepository users;
    @MockitoBean OAuth2SecurityConfigurer oauth;
    @MockitoBean ClientRegistrationRepository clients;

    @Test void analyticsAndObjectDetailAreAdminOnly() throws Exception {
        when(registrations.today()).thenReturn(java.time.LocalDate.of(2026,10,22));
        when(payments.today()).thenReturn(java.time.LocalDate.of(2026,10,22));
        for(String path:List.of("/api/admin/registration-analytics","/api/admin/payments","/api/admin/payments/999")) {
            mvc.perform(get(path)).andExpect(status().isUnauthorized());
            mvc.perform(get(path).with(user("student").roles("STUDENT"))).andExpect(status().isForbidden());
            mvc.perform(get(path).with(user("admin").roles("ADMIN"))).andExpect(status().isOk()).andExpect(header().string("Cache-Control","no-store"));
        }
    }
    @Test void deletionAndPriceMutationRejectStudentAndAnonymous() throws Exception {
        mvc.perform(delete("/api/admin/students/1").contentType("application/json").content("{\"reason\":\"test\"}")).andExpect(status().isUnauthorized());
        mvc.perform(delete("/api/admin/students/1").with(user("student").roles("STUDENT")).contentType("application/json").content("{\"reason\":\"test\"}")).andExpect(status().isForbidden());
        mvc.perform(patch("/api/admin/dashboard/courses/1/price").with(user("student").roles("STUDENT")).contentType("application/json").content("{\"price\":0,\"expectedPrice\":0,\"reason\":\"test\"}")).andExpect(status().isForbidden());
        verifyNoInteractions(students,prices);
    }
    @Test void missingDeletionReasonAndMoneyBoundsFailBeforeMutation() throws Exception {
        for(String reason:List.of("{}","{\"reason\":\" \"}"))
            mvc.perform(delete("/api/admin/students/1").with(user("admin").roles("ADMIN")).contentType("application/json").content(reason)).andExpect(status().isBadRequest());
        for(String value:List.of("-1","10000000000000","1.001","null","\"NaN\""))
            mvc.perform(patch("/api/admin/dashboard/courses/1/price").with(user("admin").roles("ADMIN")).contentType("application/json")
                .content("{\"price\":"+value+",\"expectedPrice\":0,\"reason\":\"test\"}")).andExpect(status().isBadRequest());
        verifyNoInteractions(students,prices);
    }
}
