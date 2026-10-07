package com.app.features.auth;

import com.app.features.admin.dto.StudentManagement.AuditContext;
import com.app.features.admin.repository.AdminAuditRepository;
import com.app.features.auth.converter.*;
import com.app.features.auth.dto.request.*;
import com.app.features.auth.exception.InvalidLoginException;
import com.app.features.auth.repository.*;
import com.app.features.auth.service.*;
import com.app.features.auth.service.impl.AuthServiceImpl;
import com.app.features.model.*;
import com.app.features.model.enums.UserStatus;
import com.app.security.jwt.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.*;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.*;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@DataJpaTest(properties = {"spring.jpa.hibernate.ddl-auto=none", "spring.jpa.show-sql=false"}, showSql = false)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@EnabledIfEnvironmentVariable(named = "RUN_MYSQL_INTEGRATION_TESTS", matches = "true")
@Import({AuthenticationSettingsService.class, AuthServiceImpl.class, RegisterConverter.class, LoginConverter.class,
    AdminAuditRepository.class, AuthenticationSettingsIntegrationTest.Config.class})
class AuthenticationSettingsIntegrationTest {
    @TestConfiguration static class Config { @Bean ObjectMapper mapper() { return new ObjectMapper().findAndRegisterModules(); } }
    @Autowired TestEntityManager em;
    @Autowired AuthenticationSettingsService settings;
    @Autowired AuthenticationSettingsRepository policies;
    @Autowired AuthServiceImpl auth;
    @Autowired UserRepository users;
    @Autowired RoleRepository roles;
    @MockitoBean EmailVerificationService mail;
    @MockitoBean JwtService jwt;
    private AuditContext actor;

    @BeforeEach void fixture() {
        var admin = user(UserStatus.ACTIVE, "ADMIN");
        actor = new AuditContext(admin.getId(), "PUT", "/api/admin/auth-settings", "127.0.0.1", "Integration test");
        when(jwt.createAccessToken(any())).thenReturn("access"); when(jwt.createRefreshToken(any())).thenReturn("refresh");
    }
    @Test void disablingPersistsSkipsVerificationAndNewAccountCanLogin() {
        toggle(false); em.clear(); assertFalse(settings.current().emailVerificationEnabled());
        var request = registration();
        var response = auth.register(request);
        assertFalse(response.isEmailVerificationRequired());
        em.flush(); em.clear();
        assertEquals(UserStatus.ACTIVE, users.findById(response.getId()).orElseThrow().getStatus());
        assertEquals("access", auth.login(new LoginRequest(request.getEmail(), request.getPassword())).accessToken());
        verifyNoInteractions(mail);
        assertEquals(1L, ((Number) em.getEntityManager().createNativeQuery("SELECT COUNT(*) FROM audit_logs WHERE user_id = :id AND action = 'AUTH_SETTINGS_UPDATE'")
            .setParameter("id", actor.actorId()).getSingleResult()).longValue());
    }
    @Test void enabledRegistrationRequiresVerificationAndReenableKeepsExistingActiveAccounts() {
        toggle(false); var first = registration(); var firstResponse = auth.register(first);
        toggle(true); var next = registration(); var nextResponse = auth.register(next);
        assertTrue(nextResponse.isEmailVerificationRequired());
        assertEquals(UserStatus.PENDING, users.findById(nextResponse.getId()).orElseThrow().getStatus());
        verify(mail).sendVerificationEmail(argThat(user -> user.getId().equals(nextResponse.getId())));
        assertThrows(InvalidLoginException.class, () -> auth.login(new LoginRequest(next.getEmail(), next.getPassword())));
        assertEquals(UserStatus.ACTIVE, users.findById(firstResponse.getId()).orElseThrow().getStatus());
        assertEquals("access", auth.login(new LoginRequest(first.getEmail(), first.getPassword())).accessToken());
    }
    @Test void pendingStudentIsActivatedOnlyAfterCorrectPasswordWhileVerificationIsOff() {
        var pending = user(UserStatus.PENDING, "STUDENT"); Long id = pending.getId(); String email = pending.getEmail();
        toggle(false);
        assertThrows(InvalidLoginException.class, () -> auth.login(new LoginRequest(email, "WrongPassword")));
        assertEquals(UserStatus.PENDING, users.findById(id).orElseThrow().getStatus());
        assertEquals("access", auth.login(new LoginRequest(email, "Password1")).accessToken());
        em.clear(); assertEquals(UserStatus.ACTIVE, users.findById(id).orElseThrow().getStatus());
        verifyNoInteractions(mail);
    }
    @Test void disabledPolicyCannotUnlockBlockedInactiveOrAdminAccounts() {
        toggle(false);
        for (UserStatus status : new UserStatus[]{UserStatus.DISABLE, UserStatus.LOCKED, UserStatus.BANNED, UserStatus.SUSPENDED, UserStatus.INACTIVE, UserStatus.DELETED}) {
            var blocked = user(status, "STUDENT");
            assertThrows(InvalidLoginException.class, () -> auth.login(new LoginRequest(blocked.getEmail(), "Password1")));
            assertEquals(0, users.activatePendingStudent(blocked.getId()));
        }
        var admin = user(UserStatus.PENDING, "ADMIN");
        assertThrows(InvalidLoginException.class, () -> auth.login(new LoginRequest(admin.getEmail(), "Password1")));
        var mixed = user(UserStatus.PENDING, "STUDENT"); mixed.getRoles().add(roles.findByName("ADMIN").orElseThrow()); em.flush();
        assertThrows(InvalidLoginException.class, () -> auth.login(new LoginRequest(mixed.getEmail(), "Password1")));
        assertEquals(0, users.activatePendingStudent(mixed.getId()));
        verifyNoInteractions(jwt, mail);
    }
    private void toggle(boolean enabled) { settings.update(new AuthenticationSettingsService.Update(enabled, "Test registration policy"), actor); em.flush(); }
    private RegisterRequest registration() {
        var request = new RegisterRequest(); request.setFullName("Registration policy fixture"); request.setEmail("register-policy-" + UUID.randomUUID() + "@example.test"); request.setPassword("Password1"); return request;
    }
    private UserEntity user(UserStatus status, String roleName) {
        var role = roles.findByName(roleName).orElseGet(() -> { var r = new RoleEntity(); r.setName(roleName); return em.persistAndFlush(r); });
        var u = new UserEntity(); u.setFullName("Auth policy fixture"); u.setEmail("auth-policy-" + UUID.randomUUID() + "@example.test"); u.setPasswordHash("Password1"); u.setStatus(status); u.getRoles().add(role); return em.persistAndFlush(u);
    }
}
