package com.app.security;

import com.app.features.auth.repository.UserRepository;
import com.app.features.mailSender.service.MailService;
import com.app.features.model.*;
import com.app.features.oauth.service.OAuthAuthorizationCodeService;
import com.app.features.auth.service.VerificationTokenService;
import com.app.features.users.service.UserProfileService;
import com.app.features.users.dto.request.UpdateUserProfileRequest;
import com.app.security.jwt.JwtService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.http.HttpMethod;
import java.util.*;
import java.util.stream.Stream;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("security-test")
@org.springframework.test.context.ContextConfiguration(initializers = com.app.security.support.InMemoryDatabaseGuard.class)
@Transactional
class SecurityAuditIntegrationTest {
    private org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder authPost(String path) throws Exception {
        var response = mvc.perform(get("/api/auth/csrf")).andExpect(status().isOk()).andReturn().getResponse();
        String token = new com.fasterxml.jackson.databind.ObjectMapper().readTree(response.getContentAsString()).get("token").asText();
        return post(path).header("Origin", "http://localhost:5173").cookie(response.getCookie("XSRF-TOKEN"))
                .header("X-XSRF-TOKEN", token);
    }
    @Autowired MockMvc mvc;
    @Autowired EntityManager em;
    @Autowired JwtService jwt;
    @Autowired UserRepository users;
    @Autowired UserProfileService profiles;
    @Autowired OAuthAuthorizationCodeService oauthCodes;
    @Autowired org.springframework.security.oauth2.client.registration.ClientRegistrationRepository oauthClients;
    @Autowired VerificationTokenService verification;
    @MockitoBean MailService mail;
    private UserEntity alice, bob, admin;
    private static final String HASH = new BCryptPasswordEncoder().encode("Password1");

    @BeforeEach void fixtures() {
        var student = new RoleEntity(); student.setName("STUDENT"); em.persist(student);
        var administrator = new RoleEntity(); administrator.setName("ADMIN"); em.persist(administrator);
        alice = user("alice", student); bob = user("bob", student); admin = user("admin", administrator);
        var settings = new AuthenticationSettingsEntity(); settings.setId(1); settings.setEmailVerificationEnabled(false); em.persist(settings);
        em.flush();
    }
    @AfterEach void clearIdentity() { SecurityContextHolder.clearContext(); }
    private UserEntity user(String name, RoleEntity role) {
        var value = new UserEntity(); value.setFullName(name); value.setEmail(name + "@example.test");
        value.setPasswordHash(HASH); value.getRoles().add(role); em.persist(value); return value;
    }
    private String bearer(UserEntity user) { return "Bearer " + jwt.createAccessToken(user); }
    private long count(String entity) { return em.createQuery("select count(e) from " + entity + " e", Long.class).getSingleResult(); }

    static Stream<String> protectedEndpoints() {
        return Stream.of("GET /api/auth/me", "GET /api/users/999", "GET /api/users/999/orders", "PATCH /api/users/999", "PATCH /api/users/change-password",
            "GET /api/learning/activity", "GET /api/learning/stats", "GET /api/learning/courses/1", "GET /api/learning/courses/1/progress",
            "PUT /api/learning/courses/1/lessons/2/progress", "PUT /api/learning/courses/1/lessons/2/playback",
            "POST /api/learning/courses/1/quizzes/2/submissions", "PUT /api/learning/courses/1/assignments/2/submission",
            "POST /api/payments/create", "POST /api/payments/invoices/1/sync", "GET /api/subscriptions/me", "POST /api/subscriptions/trial",
            "GET /api/admin/dashboard", "GET /api/admin/dashboard/courses", "GET /api/admin/students", "GET /api/admin/students/1",
            "PATCH /api/admin/students/1/status", "POST /api/admin/students/1/subscription/grant", "POST /api/admin/students/1/subscription/revoke",
            "GET /api/admin/subscription-plans", "POST /api/admin/subscription-plans", "PUT /api/admin/subscription-plans/STANDARD",
            "GET /api/admin/auth-settings", "PUT /api/admin/auth-settings", "GET /api/admin/assignments/submissions",
            "PUT /api/admin/assignments/submissions/1/grade", "GET /api/categories", "GET /api/tags", "GET /api/coupon/CODE");
    }
    @ParameterizedTest @MethodSource("protectedEndpoints")
    void guestsAndMalformedTokensCannotReachProtectedApis(String endpoint) throws Exception {
        String[] parts = endpoint.split(" ", 2);
        for (String header : List.of("", "Bearer not.a.jwt")) {
            var request = request(HttpMethod.valueOf(parts[0]), parts[1]).contentType("application/json").content("{}");
            if (!header.isEmpty()) request.header("Authorization", header);
            mvc.perform(request).andExpect(status().isUnauthorized());
        }
        assertEquals(3, count("UserEntity")); assertEquals(0, count("InvoiceEntity"));
        assertEquals(0, count("AssignmentSubmissionEntity")); assertEquals(0, count("UserSubscriptionEntity"));
        assertEquals(0, count("AuditLogEntity"));
    }
    static Stream<String> adminEndpoints() { return protectedEndpoints().filter(endpoint -> endpoint.contains("/api/admin/")); }
    @ParameterizedTest @MethodSource("adminEndpoints")
    void studentCannotUseAdminApis(String endpoint) throws Exception {
        String[] parts = endpoint.split(" ", 2);
        mvc.perform(request(HttpMethod.valueOf(parts[0]), parts[1]).header("Authorization", bearer(alice))
            .contentType("application/json").content("{}")).andExpect(status().isForbidden());
        assertEquals(0, count("AuditLogEntity")); assertEquals(0, count("SubscriptionPlanEntity"));
        assertEquals(0, count("UserSubscriptionEntity")); assertEquals("bob", em.find(UserEntity.class, bob.getId()).getFullName());
    }
    @Test void foreignProfileReadAndOrdersAreDenied() throws Exception {
        mvc.perform(get("/api/users/" + bob.getId()).header("Authorization", bearer(alice))).andExpect(status().isForbidden());
        mvc.perform(get("/api/users/" + bob.getId() + "/orders").header("Authorization", bearer(alice))).andExpect(status().isForbidden());
    }
    @Test void foreignProfileUpdateDoesNotChangeDatabase() throws Exception {
        Long victimId = bob.getId();
        mvc.perform(patch("/api/users/" + victimId).header("Authorization", bearer(alice)).contentType("application/json")
            .content("{\"fullName\":\"Hijacked\",\"userId\":" + alice.getId() + ",\"roles\":[\"ADMIN\"],\"status\":\"ACTIVE\"}"))
            .andExpect(status().isForbidden());
        em.flush(); em.clear(); assertEquals("bob", em.find(UserEntity.class, victimId).getFullName());
        assertEquals(3, count("UserEntity"));
    }
    @Test void serviceAlsoDeniesForeignOwner() {
        var context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(UsernamePasswordAuthenticationToken.authenticated(alice, null, List.of(new SimpleGrantedAuthority("ROLE_STUDENT"))));
        SecurityContextHolder.setContext(context);
        var update = new UpdateUserProfileRequest(); update.setFullName("Hijacked");
        assertThrows(org.springframework.security.access.AccessDeniedException.class, () -> profiles.updateProfile(bob.getId(), update));
        assertEquals("bob", em.find(UserEntity.class, bob.getId()).getFullName());
    }
    @Test void ownProfileUpdateIgnoresSensitiveFields() throws Exception {
        Long id = alice.getId();
        mvc.perform(patch("/api/users/" + id).header("Authorization", bearer(alice)).contentType("application/json")
            .content("{\"fullName\":\"Updated Alice\",\"id\":999,\"email\":\"attacker@example.test\",\"roles\":[\"ADMIN\"],\"passwordHash\":\"owned\",\"status\":\"DISABLE\"}"))
            .andExpect(status().isOk());
        em.flush(); em.clear(); var saved = users.findByIdWithRoles(id).orElseThrow();
        assertEquals("Updated Alice", saved.getFullName()); assertEquals("alice@example.test", saved.getEmail());
        assertEquals(HASH, saved.getPasswordHash()); assertEquals("STUDENT", saved.getRoles().iterator().next().getName());
        assertEquals(com.app.features.model.enums.UserStatus.ACTIVE, saved.getStatus());
    }
    @Test void passwordChangeCannotTargetBodyEmail() throws Exception {
        Long victim = bob.getId();
        bob.setPasswordHash("Password1"); em.flush();
        mvc.perform(patch("/api/users/change-password").header("Authorization", bearer(alice)).contentType("application/json")
            .content("{\"email\":\"bob@example.test\",\"current_password\":\"Password1\",\"new_password\":\"NewPassword1\",\"confirm_password\":\"NewPassword1\"}"))
            .andExpect(status().isForbidden());
        em.flush(); em.clear(); assertEquals("Password1", em.find(UserEntity.class, victim).getPasswordHash());
    }
    @Test void passwordChangeRejectsWrongPasswordAndHashesAcceptedPassword() throws Exception {
        mvc.perform(patch("/api/users/change-password").header("Authorization", bearer(alice)).contentType("application/json")
            .content("{\"current_password\":\"wrong\",\"new_password\":\"NewPassword1\",\"confirm_password\":\"NewPassword1\"}"))
            .andExpect(status().isBadRequest());
        assertEquals(HASH, users.findById(alice.getId()).orElseThrow().getPasswordHash());
        String oldAccess = bearer(alice), oldRefresh = jwt.createRefreshToken(alice);
        mvc.perform(patch("/api/users/change-password").header("Authorization", oldAccess).contentType("application/json")
            .content("{\"current_password\":\"Password1\",\"new_password\":\"NewPassword1\",\"confirm_password\":\"NewPassword1\"}"))
            .andExpect(status().isOk());
        em.flush(); em.clear(); String saved = em.find(UserEntity.class, alice.getId()).getPasswordHash();
        assertNotEquals("NewPassword1", saved); assertTrue(new BCryptPasswordEncoder().matches("NewPassword1", saved));
        mvc.perform(get("/api/auth/me").header("Authorization", oldAccess)).andExpect(status().isUnauthorized());
        mvc.perform(authPost("/api/auth/refresh").contentType("application/json").content("{\"refreshToken\":\"" + oldRefresh + "\"}"))
            .andExpect(status().isUnauthorized());
    }
    @Test void oauthMarkerCannotBeUsedAsLoginPassword() throws Exception {
        alice.setPasswordHash("{oauth}"); em.flush();
        mvc.perform(authPost("/api/auth/login").contentType("application/json").content("{\"email\":\"alice@example.test\",\"password\":\"{oauth}\"}"))
            .andExpect(status().isUnauthorized());
    }
    @Test void registrationHashesPasswordAndCannotAssignAdmin() throws Exception {
        mvc.perform(post("/api/auth/register").contentType("application/json")
            .content("{\"fullName\":\"New Student\",\"email\":\"new@example.test\",\"password\":\"Password1\",\"roles\":[\"ADMIN\"],\"status\":\"ACTIVE\",\"ownerId\":1}"))
            .andExpect(status().isCreated());
        em.flush(); em.clear(); var saved = users.findByEmailWithRoles("new@example.test").orElseThrow();
        assertNotEquals("Password1", saved.getPasswordHash()); assertTrue(new BCryptPasswordEncoder().matches("Password1", saved.getPasswordHash()));
        assertEquals(List.of("STUDENT"), saved.getRoles().stream().map(RoleEntity::getName).toList());
    }
    @Test void resetHashesPasswordAndTokenCannotBeReused() throws Exception {
        String oldAccess = bearer(alice);
        verification.createPasswordResetToken(alice, "123456"); em.flush();
        String body = "{\"email\":\"alice@example.test\",\"token\":\"123456\",\"new_password\":\"ResetPassword1\",\"confirm_password\":\"ResetPassword1\"}";
        mvc.perform(patch("/api/auth/reset-password").contentType("application/json").content(body)).andExpect(status().isOk());
        em.flush(); em.clear(); String saved = em.find(UserEntity.class, alice.getId()).getPasswordHash();
        assertNotEquals("ResetPassword1", saved); assertTrue(new BCryptPasswordEncoder().matches("ResetPassword1", saved));
        mvc.perform(get("/api/auth/me").header("Authorization", oldAccess)).andExpect(status().isUnauthorized());
        mvc.perform(patch("/api/auth/reset-password").contentType("application/json").content(body)).andExpect(status().isBadRequest());
        assertEquals(saved, em.find(UserEntity.class, alice.getId()).getPasswordHash());
    }
    @Test void validOAuthCodeExchangesOnceAndInvalidCodeIs401() throws Exception {
        String code = oauthCodes.create(alice); em.flush();
        String body = "{\"code\":\"" + code + "\"}";
        mvc.perform(authPost("/api/auth/oauth/exchange").contentType("application/json").content(body))
            .andExpect(status().isOk()).andExpect(jsonPath("user.id").value(alice.getId())).andExpect(jsonPath("accessToken").isString());
        mvc.perform(authPost("/api/auth/oauth/exchange").contentType("application/json").content(body)).andExpect(status().isUnauthorized());
    }
    @Test void sessionCookieAloneCannotAuthorizeApiMutation() throws Exception {
        var context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(UsernamePasswordAuthenticationToken.authenticated(alice, null, List.of(new SimpleGrantedAuthority("ROLE_STUDENT"))));
        var session = new MockHttpSession(); session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);
        mvc.perform(patch("/api/users/" + alice.getId()).session(session).contentType("application/json").content("{\"fullName\":\"CSRF change\"}"))
            .andExpect(status().isUnauthorized());
        assertEquals("alice", em.find(UserEntity.class, alice.getId()).getFullName());
    }
    @Test void validUsersAndAdminsReachTheirOwnApis() throws Exception {
        mvc.perform(get("/api/users/" + alice.getId()).header("Authorization", bearer(alice))).andExpect(status().isOk());
        mvc.perform(get("/api/admin/auth-settings").header("Authorization", bearer(admin))).andExpect(status().isOk());
    }
    @Test void expiredWrongSignatureAndRefreshTokensCannotAuthorizeApi() throws Exception {
        String secret = Base64.getEncoder().encodeToString(new byte[32]);
        var expired = new JwtService(secret, java.time.Duration.ofSeconds(-5), java.time.Duration.ofDays(1));
        byte[] otherKey = new byte[32]; Arrays.fill(otherKey, (byte) 1);
        var other = new JwtService(Base64.getEncoder().encodeToString(otherKey), java.time.Duration.ofMinutes(15), java.time.Duration.ofDays(1));
        for (String token : List.of(expired.createAccessToken(alice), other.createAccessToken(alice), jwt.createRefreshToken(alice)))
            mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token)).andExpect(status().isUnauthorized());
    }
    @Test void tokenWithoutExpirationOrCredentialStampIsRejected() throws Exception {
        var key = io.jsonwebtoken.security.Keys.hmacShaKeyFor(new byte[32]);
        String token = io.jsonwebtoken.Jwts.builder().subject(alice.getId().toString()).claim("type", "access").signWith(key).compact();
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token)).andExpect(status().isUnauthorized());
    }
    @Test void signedRoleClaimCannotEscalateDatabaseStudent() throws Exception {
        var original = jwt.parse(jwt.createAccessToken(alice));
        String token = io.jsonwebtoken.Jwts.builder().claims(new HashMap<>(original)).claim("roles", List.of("ADMIN"))
            .signWith(io.jsonwebtoken.security.Keys.hmacShaKeyFor(new byte[32])).compact();
        mvc.perform(get("/api/admin/auth-settings").header("Authorization", "Bearer " + token)).andExpect(status().isForbidden());
        assertFalse(users.findByIdWithRoles(alice.getId()).orElseThrow().getRoles().stream().anyMatch(role -> role.getName().equals("ADMIN")));
    }
    @Test void disablingAccountInvalidatesItsAccessAndRefreshTokens() throws Exception {
        String access = bearer(alice), refresh = jwt.createRefreshToken(alice);
        alice.setStatus(com.app.features.model.enums.UserStatus.DISABLE); em.flush();
        mvc.perform(get("/api/auth/me").header("Authorization", access)).andExpect(status().isUnauthorized());
        mvc.perform(authPost("/api/auth/refresh").contentType("application/json").content("{\"refreshToken\":\"" + refresh + "\"}"))
            .andExpect(status().isUnauthorized());
    }
    @Test void facebookLoginAndCallbackAreUnavailable() throws Exception {
        assertNull(oauthClients.findByRegistrationId("facebook"));
        assertNotNull(oauthClients.findByRegistrationId("google"));
        mvc.perform(get("/api/oauth2/authorization/facebook")).andExpect(status().is4xxClientError());
        mvc.perform(get("/login/oauth2/code/facebook").param("code", "retired-code").param("state", "retired-state"))
            .andExpect(status().is4xxClientError());
        assertEquals(3, count("UserEntity"));
        assertEquals(0, count("OAuthAuthorizationCodeEntity"));
    }

    @Test void oauthHandshakeRetainsStateWithoutAuthorizingApiByCookie() throws Exception {
        var result = mvc.perform(get("/api/oauth2/authorization/google")).andExpect(status().isFound()).andReturn();
        var session = (MockHttpSession) result.getRequest().getSession(false);
        assertNotNull(session);
        String state = org.springframework.web.util.UriComponentsBuilder.fromUriString(result.getResponse().getHeader("Location"))
            .build().getQueryParams().getFirst("state");
        assertNotNull(state);
        state = java.net.URLDecoder.decode(state, java.nio.charset.StandardCharsets.UTF_8);
        mvc.perform(get("/login/oauth2/code/google").session(session).param("state", state).param("error", "access_denied"))
            .andExpect(status().isFound()).andExpect(redirectedUrl("http://localhost:5173/oauth/callback?error=access_denied"));
        mvc.perform(get("/api/auth/me").session(session)).andExpect(status().isUnauthorized());
    }
    @Test void guessingResetCodeIsLimitedAndDoesNotChangePassword() throws Exception {
        var role = alice.getRoles().iterator().next();
        var target = user("otp-" + UUID.randomUUID(), role); em.flush();
        verification.createPasswordResetToken(target, "123456"); em.flush();
        String body = "{\"email\":\"" + target.getEmail() + "\",\"token\":\"000000\",\"new_password\":\"ResetPassword1\",\"confirm_password\":\"ResetPassword1\"}";
        for (int attempt = 0; attempt < 5; attempt++)
            mvc.perform(patch("/api/auth/reset-password").contentType("application/json").content(body)).andExpect(status().isBadRequest());
        mvc.perform(patch("/api/auth/reset-password").contentType("application/json").content(body)).andExpect(status().isTooManyRequests());
        em.flush(); em.clear(); assertEquals(HASH, em.find(UserEntity.class, target.getId()).getPasswordHash());
    }
    @Test void legacyPasswordIsMigratedAfterSuccessfulLogin() throws Exception {
        alice.setPasswordHash("Password1"); em.flush();
        mvc.perform(authPost("/api/auth/login").contentType("application/json").content("{\"email\":\"alice@example.test\",\"password\":\"Password1\"}"))
            .andExpect(status().isOk());
        em.flush(); em.clear(); String saved = em.find(UserEntity.class, alice.getId()).getPasswordHash();
        assertNotEquals("Password1", saved); assertTrue(new BCryptPasswordEncoder().matches("Password1", saved));
    }
    @Test void publicReadApisWorkAndUnknownRoutesAreDenied() throws Exception {
        mvc.perform(get("/api/courses")).andExpect(status().isOk());
        mvc.perform(get("/api/subscriptions/plans")).andExpect(status().isOk());
        mvc.perform(post("/api/unclassified").header("Authorization", bearer(alice)).contentType("application/json").content("{}"))
            .andExpect(status().isForbidden());
    }
    @Test void foreignInvoiceSyncIsDeniedAndOwnedPaidInvoiceIsReadable() throws Exception {
        var invoice = new InvoiceEntity(); invoice.setUser(bob);
        invoice.setAmount(java.math.BigDecimal.TEN); invoice.setOriginalAmount(java.math.BigDecimal.TEN);
        invoice.setStatus(com.app.features.model.enums.InvoiceStatus.PAID); em.persist(invoice);
        var payment = new PaymentEntity(); payment.setInvoice(invoice); payment.setAmount(java.math.BigDecimal.TEN);
        payment.setProvider(com.app.features.model.enums.PaymentProvider.PAYOS); payment.setTransactionId("test-order");
        payment.setStatus(com.app.features.model.enums.PaymentStatus.SUCCESS); em.persist(payment); em.flush();
        Long invoiceId = invoice.getId();
        mvc.perform(post("/api/payments/invoices/" + invoiceId + "/sync").header("Authorization", bearer(alice)))
            .andExpect(status().isForbidden());
        em.flush(); em.clear();
        assertEquals(com.app.features.model.enums.InvoiceStatus.PAID, em.find(InvoiceEntity.class, invoiceId).getStatus());
        assertEquals(1, count("InvoiceEntity")); assertEquals(1, count("PaymentEntity"));
        mvc.perform(post("/api/payments/invoices/" + invoiceId + "/sync").header("Authorization", bearer(bob)))
            .andExpect(status().isOk()).andExpect(jsonPath("paid").value(true));
    }
    @Test void trialIgnoresSpoofedUserIdAndOnlyCreatesOwnSubscription() throws Exception {
        var plan = new SubscriptionPlanEntity(); plan.setCode("FREE_TRIAL"); plan.setName("Trial");
        plan.setDurationDays(3); plan.setPrice(java.math.BigDecimal.ZERO); em.persist(plan); em.flush();
        mvc.perform(post("/api/subscriptions/trial").header("Authorization", bearer(alice)).contentType("application/json")
            .content("{\"userId\":" + bob.getId() + ",\"planCode\":\"PREMIUM\",\"expiresAt\":\"2037-01-01T00:00:00Z\"}"))
            .andExpect(status().isOk());
        em.flush(); em.clear();
        assertNotNull(em.find(UserSubscriptionEntity.class, alice.getId()));
        assertNull(em.find(UserSubscriptionEntity.class, bob.getId())); assertEquals(1, count("UserSubscriptionEntity"));
        assertEquals("FREE_TRIAL", em.find(UserSubscriptionEntity.class, alice.getId()).getPlanCode());
    }
    @Test void invalidWebhookCannotCreatePaymentsOrGrantSubscription() throws Exception {
        mvc.perform(post("/api/payments/payos-webhook").contentType("application/json")
            .content("{\"data\":{\"orderCode\":123,\"amount\":10,\"code\":\"00\"},\"signature\":\"forged\"}"))
            .andExpect(status().isBadRequest());
        assertEquals(0, count("PaymentEntity")); assertEquals(0, count("InvoiceEntity")); assertEquals(0, count("UserSubscriptionEntity"));
    }
    @Test void logoutRequiresPost() throws Exception {
        mvc.perform(get("/api/auth/logout").header("Authorization", bearer(alice))).andExpect(status().isForbidden());
        mvc.perform(authPost("/api/auth/logout").header("Authorization", bearer(alice))).andExpect(status().isNoContent());
    }
    @Test void oauthInitiationCannotBypassIpLimiterByShortCircuitingFilterChain() throws Exception {
        for (int attempt = 0; attempt < 60; attempt++) {
            mvc.perform(get("/api/oauth2/authorization/google").with(request -> {
                request.setRemoteAddr("198.51.100.7"); return request;
            })).andExpect(status().isFound());
        }
        mvc.perform(get("/api/oauth2/authorization/google").with(request -> {
            request.setRemoteAddr("198.51.100.7"); return request;
        })).andExpect(status().isTooManyRequests());
        assertEquals(3, count("UserEntity")); assertEquals(0, count("OAuthAuthorizationCodeEntity"));
    }
}
