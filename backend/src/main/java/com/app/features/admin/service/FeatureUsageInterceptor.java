package com.app.features.admin.service;

import com.app.features.model.UserEntity;
import com.app.security.oauth.CustomOAuth2User;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.servlet.*;
import org.springframework.web.servlet.config.annotation.*;
import java.time.*;

@Configuration @RequiredArgsConstructor @Slf4j
public class FeatureUsageInterceptor {
    private final ActivityLabService usage;
    private final Clock clock;
    @Bean public WebMvcConfigurer featureTracking() { return new WebMvcConfigurer() {
    @Override public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new HandlerInterceptor() {
            @Override public void afterCompletion(HttpServletRequest request,HttpServletResponse response,Object handler,Exception exception) {
                if(exception!=null || response.getStatus()<200 || response.getStatus()>=300 || "OPTIONS".equals(request.getMethod())) return;
                var auth=SecurityContextHolder.getContext().getAuthentication();
                if(auth==null || auth.getAuthorities().stream().noneMatch(a->"ROLE_STUDENT".equals(a.getAuthority()))) return;
                Object principal=auth.getPrincipal();
                Long id=principal instanceof UserEntity u?u.getId():principal instanceof CustomOAuth2User u?u.getUser().getId():null;
                if(id==null) return;
                String path=request.getRequestURI().substring(request.getContextPath().length());
                String feature=feature(path);
                if(feature!=null) try { usage.recordFeature(id,feature,LocalDate.now(clock.withZone(LearningAnalyticsService.ZONE))); }
                catch(RuntimeException e) { log.warn("Cannot record feature usage: {}",e.getMessage()); }
            }
        }).addPathPatterns("/api/learning/**","/api/courses/**","/api/subscriptions/**","/api/users/**","/api/feedback/**");
    }
    }; }
    static String feature(String path) {
        if(path.contains("/quizzes/")) return "QUIZZES";
        if(path.contains("/assignments/")) return "ASSIGNMENTS";
        if(path.startsWith("/api/learning/")) return "LEARNING";
        if(path.startsWith("/api/courses")) return "COURSES";
        if(path.startsWith("/api/subscriptions/")) return "SUBSCRIPTION";
        if(path.startsWith("/api/users/")) return "PROFILE";
        if(path.startsWith("/api/feedback/")) return "FEEDBACK";
        return null;
    }
}
