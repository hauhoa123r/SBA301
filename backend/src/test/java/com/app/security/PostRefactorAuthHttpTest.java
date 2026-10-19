package com.app.security;

import com.app.features.auth.repository.RefreshSessionRepository;
import com.app.features.auth.service.RefreshSessionService;
import com.app.features.mailSender.service.MailService;
import com.app.features.model.*;
import com.app.features.model.enums.UserStatus;
import com.app.security.jwt.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.*;
import org.springframework.test.context.bean.override.mockito.*;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.net.URI;
import java.net.http.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/** Real TCP HTTP + embedded Tomcat + complete filter chain; no Postman/browser claim. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "server.address=127.0.0.1",
        "app.cors.allowed-origins=http://localhost:5173,http://127.0.0.1:5197",
        "spring.datasource.url=jdbc:h2:mem:postrefactorauth;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1;INIT=CREATE SCHEMA IF NOT EXISTS chinese_online_learning",
        "logging.level.root=WARN"
})
@ActiveProfiles("security-test")
@ContextConfiguration(initializers = com.app.security.support.InMemoryDatabaseGuard.class)
class PostRefactorAuthHttpTest {
    @LocalServerPort int port;
    @Autowired EntityManager em;
    @Autowired PlatformTransactionManager transactions;
    @Autowired RefreshSessionRepository sessions;
    @Autowired JwtService jwt;
    @Autowired ObjectMapper json;
    @MockitoBean MailService mail;
    @MockitoSpyBean RefreshSessionService refresh;
    private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
    private UserEntity user;
    private Long roleId;
    private static final String ORIGIN = "http://localhost:5173";
    record Csrf(String cookie, String token) { }

    @BeforeEach void fixture() {
        new TransactionTemplate(transactions).executeWithoutResult(tx -> {
            var role = new RoleEntity(); role.setName("STUDENT"); em.persist(role); roleId = role.getId();
            user = new UserEntity(); user.setEmail("http-" + UUID.randomUUID() + "@example.test");
            user.setFullName("HTTP audit"); user.setPasswordHash(com.app.security.password.PasswordHashing.encode("Password1"));
            user.setStatus(UserStatus.ACTIVE); user.getRoles().add(role); em.persist(user); em.flush();
        });
    }
    @AfterEach void cleanup() {
        new TransactionTemplate(transactions).executeWithoutResult(tx -> {
            em.createQuery("delete from RefreshSessionEntity s where s.user.id = :id").setParameter("id", user.getId()).executeUpdate();
            em.remove(em.find(UserEntity.class, user.getId())); em.remove(em.find(RoleEntity.class, roleId));
        });
    }
    private URI uri(String path) { return URI.create("http://127.0.0.1:" + port + path); }
    private HttpResponse<String> send(HttpRequest.Builder request) throws Exception {
        return client.send(request.timeout(Duration.ofSeconds(10)).build(), HttpResponse.BodyHandlers.ofString());
    }
    private HttpRequest.Builder post(String path, String cookies, String origin, String csrf, String body) {
        var builder = HttpRequest.newBuilder(uri(path)).header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body));
        if (cookies != null) builder.header("Cookie", cookies);
        if (origin != null) builder.header("Origin", origin);
        if (csrf != null) builder.header("X-XSRF-TOKEN", csrf);
        return builder;
    }
    private Csrf csrf() throws Exception {
        var response = send(HttpRequest.newBuilder(uri("/api/auth/csrf")).GET());
        assertEquals(200, response.statusCode());
        return new Csrf(cookie(response, "XSRF-TOKEN"), json.readTree(response.body()).get("token").asText());
    }
    private String cookie(HttpResponse<?> response, String name) {
        return response.headers().allValues("set-cookie").stream().filter(h -> h.startsWith(name + "="))
                .findFirst().orElseThrow().split(";", 2)[0];
    }
    private HttpResponse<String> auth(String path, String refreshCookie) throws Exception {
        var csrf = csrf();
        return send(post(path, csrf.cookie() + (refreshCookie == null ? "" : "; " + refreshCookie), ORIGIN, csrf.token(), "{}"));
    }
    private HttpResponse<String> login() throws Exception {
        var csrf = csrf();
        var response = send(post("/api/auth/login", csrf.cookie(), ORIGIN, csrf.token(),
                json.writeValueAsString(Map.of("email", user.getEmail(), "password", "Password1"))));
        assertEquals(200, response.statusCode());
        assertFalse(json.readTree(response.body()).has("refreshToken"));
        return response;
    }
    @Test void cookieRotationLogoutAndReopenAreVerifiedOverHttp() throws Exception {
        var loggedIn = login();
        String first = cookie(loggedIn, RefreshCookie.NAME);
        String header = loggedIn.headers().allValues("set-cookie").stream().filter(h -> h.startsWith(first)).findFirst().orElseThrow();
        assertTrue(header.contains("HttpOnly")); assertTrue(header.contains("Path=/api/auth"));
        assertTrue(header.contains("SameSite=Lax")); assertFalse(header.contains("Domain="));
        assertTrue(loggedIn.headers().firstValue("cache-control").orElse("").contains("no-store"));
        assertEquals(401, send(HttpRequest.newBuilder(uri("/api/auth/me")).header("Cookie", first).GET()).statusCode());
        var rotated = auth("/api/auth/refresh", first); assertEquals(200, rotated.statusCode());
        String next = cookie(rotated, RefreshCookie.NAME); assertNotEquals(first, next);
        var conflict = auth("/api/auth/refresh", first);
        assertEquals(409, conflict.statusCode()); assertTrue(conflict.headers().allValues("set-cookie").isEmpty());
        var logout = auth("/api/auth/logout", next); assertEquals(204, logout.statusCode());
        String deletion = logout.headers().allValues("set-cookie").stream().filter(h -> h.startsWith("refresh_session=")).findFirst().orElseThrow();
        assertTrue(deletion.contains("Max-Age=0")); assertTrue(deletion.contains("Path=/api/auth")); assertFalse(deletion.contains("Domain="));
        assertEquals(401, auth("/api/auth/refresh", next).statusCode());
        assertEquals(401, auth("/api/auth/refresh", first).statusCode());
        assertEquals(401, auth("/api/auth/refresh", null).statusCode());
    }
    @Test void modifiedExpiredRevokedAndPasswordChangedRefreshAreRejected() throws Exception {
        String token = cookie(login(), RefreshCookie.NAME).split("=", 2)[1];
        String[] parts = token.split("\\.");
        parts[2] = (parts[2].startsWith("A") ? "B" : "A") + parts[2].substring(1);
        assertEquals(401, auth("/api/auth/refresh", RefreshCookie.NAME + "=" + String.join(".", parts)).statusCode());
        String expired = jwt.createRefreshToken(user, UUID.randomUUID().toString(), Instant.now().minusSeconds(5));
        assertEquals(401, auth("/api/auth/refresh", RefreshCookie.NAME + "=" + expired).statusCode());
        String sid = jwt.parse(token).get("sid", String.class);
        new TransactionTemplate(transactions).executeWithoutResult(tx -> sessions.findById(sid).orElseThrow().setRevoked(true));
        assertEquals(401, auth("/api/auth/refresh", RefreshCookie.NAME + "=" + token).statusCode());
        String active = cookie(login(), RefreshCookie.NAME);
        new TransactionTemplate(transactions).executeWithoutResult(tx -> em.find(UserEntity.class, user.getId()).setPasswordHash("changed-test-hash"));
        assertEquals(401, auth("/api/auth/refresh", active).statusCode());
    }
    @Test void disabledUserCannotRefreshOrUsePreviouslyIssuedAccess() throws Exception {
        var loggedIn = login();
        String access = json.readTree(loggedIn.body()).get("accessToken").asText();
        new TransactionTemplate(transactions).executeWithoutResult(tx -> em.find(UserEntity.class, user.getId()).setStatus(UserStatus.DISABLE));
        assertEquals(401, send(HttpRequest.newBuilder(uri("/api/auth/me")).header("Authorization", "Bearer " + access).GET()).statusCode());
        assertEquals(401, auth("/api/auth/refresh", cookie(loggedIn, RefreshCookie.NAME)).statusCode());
    }
    @Test void csrfOriginCorsAndFormAttacksAreRejectedOnEveryCookieMutation() throws Exception {
        for (String path : List.of("/api/auth/login", "/api/auth/oauth/exchange", "/api/auth/refresh", "/api/auth/logout")) {
            var csrf = csrf();
            assertEquals(403, send(post(path, csrf.cookie(), ORIGIN, null, "{}")).statusCode());
            assertEquals(403, send(post(path, csrf.cookie(), ORIGIN, "wrong", "{}")).statusCode());
            assertEquals(403, send(post(path, csrf.cookie(), null, csrf.token(), "{}")).statusCode());
            var untrusted = send(post(path, csrf.cookie(), "https://attacker.example", csrf.token(), "{}"));
            assertEquals(403, untrusted.statusCode());
            assertTrue(untrusted.headers().firstValue("access-control-allow-origin").isEmpty());
            assertEquals(403, send(HttpRequest.newBuilder(uri(path)).header("Origin", "https://attacker.example")
                    .header("Content-Type", "application/x-www-form-urlencoded").POST(HttpRequest.BodyPublishers.ofString("x=y"))).statusCode());
        }
        var preflight = send(HttpRequest.newBuilder(uri("/api/auth/refresh")).header("Origin", ORIGIN)
                .header("Access-Control-Request-Method", "POST").header("Access-Control-Request-Headers", "X-XSRF-TOKEN").method("OPTIONS", HttpRequest.BodyPublishers.noBody()));
        assertEquals(200, preflight.statusCode());
        assertEquals(ORIGIN, preflight.headers().firstValue("access-control-allow-origin").orElseThrow());
        assertEquals("true", preflight.headers().firstValue("access-control-allow-credentials").orElseThrow());
    }
    @Test void simultaneousHttpRefreshHasOnlyOneWinnerAndLogoutAlwaysRevokes() throws Exception {
        String token = cookie(login(), RefreshCookie.NAME);
        var csrf = csrf();
        var request = post("/api/auth/refresh", csrf.cookie() + "; " + token, ORIGIN, csrf.token(), "{}").build();
        var one = client.sendAsync(request, HttpResponse.BodyHandlers.ofString());
        var two = client.sendAsync(request, HttpResponse.BodyHandlers.ofString());
        var a = one.get(10, TimeUnit.SECONDS); var b = two.get(10, TimeUnit.SECONDS);
        assertEquals(Set.of(200, 409), Set.of(a.statusCode(), b.statusCode()));
        String next = cookie(a.statusCode() == 200 ? a : b, RefreshCookie.NAME);
        var rotateRequest = post("/api/auth/refresh", csrf.cookie() + "; " + next, ORIGIN, csrf.token(), "{}").build();
        var logoutRequest = post("/api/auth/logout", csrf.cookie() + "; " + next, ORIGIN, csrf.token(), "{}").build();
        var rotation = client.sendAsync(rotateRequest, HttpResponse.BodyHandlers.ofString());
        var logout = client.sendAsync(logoutRequest, HttpResponse.BodyHandlers.ofString());
        assertEquals(204, logout.get(10, TimeUnit.SECONDS).statusCode());
        var result = rotation.get(10, TimeUnit.SECONDS);
        assertTrue(Set.of(200, 401).contains(result.statusCode()));
        assertEquals(401, auth("/api/auth/refresh", result.statusCode() == 200 ? cookie(result, RefreshCookie.NAME) : next).statusCode());
    }
    @Test void logoutWithExpiredAccessOrRefreshStillClearsCookie() throws Exception {
        String token = cookie(login(), RefreshCookie.NAME);
        var csrf = csrf();
        String secret = Base64.getEncoder().encodeToString(new byte[32]); // test-profile key only
        String expiredAccess = new JwtService(secret, Duration.ofSeconds(-5), Duration.ofDays(1)).createAccessToken(user);
        assertEquals(204, send(post("/api/auth/logout", csrf.cookie() + "; " + token, ORIGIN, csrf.token(), "{}")
                .header("Authorization", "Bearer " + expiredAccess)).statusCode());
        assertEquals(401, auth("/api/auth/refresh", token).statusCode());
        String expired = jwt.createRefreshToken(user, UUID.randomUUID().toString(), Instant.now().minusSeconds(5));
        assertEquals(204, auth("/api/auth/logout", "refresh_session=" + expired).statusCode());
    }
    @Test void failedServerLogoutDoesNotReportSuccessAndCanBeRetried() throws Exception {
        String token = cookie(login(), RefreshCookie.NAME);
        doThrow(new IllegalStateException("Simulated unavailable session store")).doCallRealMethod().when(refresh).revoke(anyString());
        assertEquals(500, auth("/api/auth/logout", token).statusCode());
        assertEquals(204, auth("/api/auth/logout", token).statusCode());
        assertEquals(401, auth("/api/auth/refresh", token).statusCode());
    }
    @Test
    @org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable(named = "RUN_AUTH_BROWSER_TESTS", matches = "true")
    void chromeSessionLifecycleWithThreeRealTabs() throws Exception {
        var root = java.nio.file.Path.of("..").toAbsolutePath().normalize();
        var artifacts = root.resolve("backend/target/post-auth-browser");
        java.nio.file.Files.createDirectories(artifacts);
        var runner = new ProcessBuilder("node", root.resolve("frontend/tests/run-auth-browser-audit.mjs").toString(),
                "http://127.0.0.1:" + port, user.getEmail(), artifacts.toString())
                .redirectErrorStream(true).redirectOutput(artifacts.resolve("browser.log").toFile()).start();
        try {
            assertTrue(runner.waitFor(120, TimeUnit.SECONDS), "Browser harness timed out; see target/post-auth-browser/browser.log");
            assertEquals(0, runner.exitValue(), "See target/post-auth-browser/browser.log (no credentials logged)");
        } finally { if (runner.isAlive()) runner.destroyForcibly(); }
        assertTrue(sessions.findAll().stream().filter(s -> s.getUser().getId().equals(user.getId())).allMatch(RefreshSessionEntity::isRevoked));
    }
}
