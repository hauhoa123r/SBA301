package com.app.security;

import com.app.features.auth.repository.RefreshSessionRepository;
import com.app.features.auth.service.RefreshSessionService;
import com.app.features.mailSender.service.MailService;
import com.app.features.model.*;
import com.app.features.model.enums.UserStatus;
import com.app.security.jwt.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.*;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("security-test")
@org.springframework.test.context.ContextConfiguration(initializers = com.app.security.support.InMemoryDatabaseGuard.class)
class TokenStorageIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired EntityManager em;
    @Autowired PlatformTransactionManager transactions;
    @Autowired RefreshSessionRepository sessions;
    @Autowired RefreshSessionService refresh;
    @Autowired JwtService jwt;
    @Autowired ObjectMapper json;
    @MockitoBean MailService mail;
    private UserEntity user;
    private Long roleId;

    @BeforeEach void fixture() {
        new TransactionTemplate(transactions).executeWithoutResult(tx -> {
            var role = new RoleEntity(); role.setName("STUDENT"); em.persist(role); roleId = role.getId();
            user = new UserEntity(); user.setEmail("storage-" + UUID.randomUUID() + "@example.test");
            user.setFullName("Token storage test"); user.setPasswordHash(com.app.security.password.PasswordHashing.encode("Password1"));
            user.setStatus(UserStatus.ACTIVE); user.getRoles().add(role); em.persist(user); em.flush();
        });
    }
    @AfterEach void cleanup() {
        new TransactionTemplate(transactions).executeWithoutResult(tx -> {
            em.createQuery("delete from RefreshSessionEntity s where s.user.id = :id").setParameter("id", user.getId()).executeUpdate();
            em.remove(em.find(UserEntity.class, user.getId()));
            em.remove(em.find(RoleEntity.class, roleId));
        });
    }
    private MockHttpServletRequestBuilder authPost(String path) throws Exception {
        var csrf = mvc.perform(get("/api/auth/csrf")).andExpect(status().isOk()).andReturn().getResponse();
        var cookie = csrf.getCookie("XSRF-TOKEN");
        assertNotNull(cookie); assertTrue(cookie.isHttpOnly());
        return post(path).header("Origin", "http://localhost:5173").cookie(cookie)
                .header("X-XSRF-TOKEN", json.readTree(csrf.getContentAsString()).get("token").asText());
    }
    private MvcResult login() throws Exception {
        return mvc.perform(authPost("/api/auth/login").contentType("application/json")
                .content(json.writeValueAsString(Map.of("email", user.getEmail(), "password", "Password1"))))
                .andExpect(status().isOk()).andExpect(jsonPath("refreshToken").doesNotExist())
                .andExpect(jsonPath("accessToken").isString()).andReturn();
    }
    private Cookie refreshCookie(MvcResult result) {
        Cookie cookie = result.getResponse().getCookie(RefreshCookie.NAME);
        assertNotNull(cookie); return cookie;
    }
    @Test void loginOnlySetsHttpOnlyRefreshCookieAndDatabaseContainsHash() throws Exception {
        var result = login(); var cookie = refreshCookie(result);
        assertTrue(cookie.isHttpOnly()); assertFalse(cookie.getSecure()); assertEquals("/api/auth", cookie.getPath());
        assertEquals("Lax", cookie.getAttribute("SameSite")); assertTrue(cookie.getMaxAge() > 0);
        String sid = jwt.parse(cookie.getValue()).get("sid", String.class);
        var stored = sessions.findById(sid).orElseThrow();
        assertEquals(64, stored.getTokenHash().length()); assertNotEquals(cookie.getValue(), stored.getTokenHash());
        assertTrue(result.getResponse().getHeader("Cache-Control").contains("no-store"));
        mvc.perform(get("/api/auth/me").cookie(cookie)).andExpect(status().isUnauthorized());
        String access = json.readTree(result.getResponse().getContentAsString()).get("accessToken").asText();
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + access)).andExpect(status().isOk());
        mvc.perform(get("/api/admin/auth-settings").header("Authorization", "Bearer " + access)).andExpect(status().isForbidden());
    }
    @Test void reloadRotatesCookieAndLogoutRevokesTheWholeSession() throws Exception {
        var first = refreshCookie(login());
        var nextResult = mvc.perform(authPost("/api/auth/refresh").cookie(first))
                .andExpect(status().isOk()).andExpect(jsonPath("refreshToken").doesNotExist()).andReturn();
        var next = refreshCookie(nextResult); assertNotEquals(first.getValue(), next.getValue());
        mvc.perform(authPost("/api/auth/refresh").cookie(first)).andExpect(status().isConflict())
                .andExpect(header().doesNotExist("Set-Cookie"));
        mvc.perform(authPost("/api/auth/logout").cookie(next)).andExpect(status().isNoContent())
                .andExpect(cookie().maxAge(RefreshCookie.NAME, 0)).andExpect(cookie().path(RefreshCookie.NAME, "/api/auth"));
        mvc.perform(authPost("/api/auth/refresh").cookie(next)).andExpect(status().isUnauthorized());
        mvc.perform(authPost("/api/auth/refresh").cookie(first)).andExpect(status().isUnauthorized());
    }
    @Test void replayOutsideConcurrencyWindowRevokesSessionAndCommitsDespite401() throws Exception {
        var first = refreshCookie(login());
        var next = refreshCookie(mvc.perform(authPost("/api/auth/refresh").cookie(first)).andExpect(status().isOk()).andReturn());
        String sid = jwt.parse(first.getValue()).get("sid", String.class);
        new TransactionTemplate(transactions).executeWithoutResult(tx -> {
            var session = sessions.findById(sid).orElseThrow(); session.setRotatedAt(Instant.now().minusSeconds(10));
        });
        mvc.perform(authPost("/api/auth/refresh").cookie(first)).andExpect(status().isUnauthorized());
        assertTrue(sessions.findById(sid).orElseThrow().isRevoked());
        mvc.perform(authPost("/api/auth/refresh").cookie(next)).andExpect(status().isUnauthorized());
    }
    @Test void missingCsrfWrongCsrfMissingOriginAndUntrustedOriginAreDenied() throws Exception {
        var cookie = refreshCookie(login());
        for (String path : List.of("/api/auth/refresh", "/api/auth/logout", "/api/auth/login", "/api/auth/oauth/exchange")) {
            mvc.perform(post(path).cookie(cookie).header("Origin", "http://localhost:5173")).andExpect(status().isForbidden());
            mvc.perform(authPost(path).cookie(cookie).with(request -> {
                request.removeHeader("X-XSRF-TOKEN"); request.addHeader("X-XSRF-TOKEN", "invalid"); return request;
            })).andExpect(status().isForbidden());
            mvc.perform(post(path).cookie(cookie)).andExpect(status().isForbidden());
            mvc.perform(post(path).cookie(cookie).header("Origin", "https://attacker.example")).andExpect(status().isForbidden());
        }
        // Rejected CSRF logout never revokes the session.
        mvc.perform(authPost("/api/auth/refresh").cookie(cookie)).andExpect(status().isOk());
    }
    @Test void expiredRevokedDisabledAndLegacyBodyTokensAreRejected() throws Exception {
        var cookie = refreshCookie(login());
        mvc.perform(authPost("/api/auth/refresh").contentType("application/json")
                .content(json.writeValueAsString(Map.of("refreshToken", cookie.getValue())))).andExpect(status().isUnauthorized());
        String sid = jwt.parse(cookie.getValue()).get("sid", String.class);
        String expired = jwt.createRefreshToken(user, sid, Instant.now().minusSeconds(1));
        mvc.perform(authPost("/api/auth/refresh").cookie(new Cookie(RefreshCookie.NAME, expired))).andExpect(status().isUnauthorized());
        new TransactionTemplate(transactions).executeWithoutResult(tx -> em.find(UserEntity.class, user.getId()).setStatus(UserStatus.DISABLE));
        mvc.perform(authPost("/api/auth/refresh").cookie(cookie)).andExpect(status().isUnauthorized());
    }
    @Test void simultaneousRefreshHasOnlyOneWinner() throws Exception {
        String token = refreshCookie(login()).getValue();
        var pool = Executors.newFixedThreadPool(2);
        var ready = new CountDownLatch(2); var start = new CountDownLatch(1);
        Callable<Integer> attempt = () -> {
            ready.countDown(); assertTrue(start.await(5, TimeUnit.SECONDS));
            try { refresh.rotate(token); return 200; }
            catch (org.springframework.web.server.ResponseStatusException ex) { return ex.getStatusCode().value(); }
        };
        try {
            var one = pool.submit(attempt); var two = pool.submit(attempt);
            assertTrue(ready.await(5, TimeUnit.SECONDS)); start.countDown();
            assertEquals(Set.of(200, 409), Set.of(one.get(10, TimeUnit.SECONDS), two.get(10, TimeUnit.SECONDS)));
        } finally { pool.shutdownNow(); }
    }
    @Test void productionCookieIsSecureAndSameSiteNoneRequiresHttps() throws Exception {
        String token = refreshCookie(login()).getValue();
        String header = new RefreshCookie(true, "Lax", jwt).header(token);
        assertTrue(header.contains("Secure")); assertTrue(header.contains("HttpOnly"));
        assertThrows(IllegalArgumentException.class, () -> new RefreshCookie(false, "None", jwt));
    }
}
