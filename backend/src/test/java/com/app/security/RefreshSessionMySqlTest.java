package com.app.security;

import com.app.features.auth.repository.RefreshSessionRepository;
import com.app.features.auth.service.RefreshSessionService;
import com.app.features.model.*;
import com.app.features.model.enums.UserStatus;
import com.app.security.jwt.JwtService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.*;
import org.springframework.transaction.annotation.*;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest(showSql = false, properties = "spring.jpa.hibernate.ddl-auto=none")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@EnabledIfEnvironmentVariable(named = "RUN_MYSQL_INTEGRATION_TESTS", matches = "true")
@Import({RefreshSessionService.class, JwtService.class})
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class RefreshSessionMySqlTest {
    @Autowired EntityManager em;
    @Autowired PlatformTransactionManager transactions;
    @Autowired RefreshSessionService refresh;
    @Autowired RefreshSessionRepository sessions;
    @Autowired JwtService jwt;
    @Autowired javax.sql.DataSource datasource;
    private UserEntity user;
    private String token;
    @BeforeEach void fixture() throws Exception {
        // Verify the actual instance before the first fixture write, even if environment gates were mis-set.
        String expected = System.getenv("POST_AUTH_MYSQL_DATADIR");
        assertNotNull(expected, "Use backend/tests/run_auth_mysql_audit.py");
        try (var connection = datasource.getConnection(); var statement = connection.createStatement()) {
            assertTrue(connection.getMetaData().getURL().startsWith("jdbc:mysql://127.0.0.1:33087/"));
            try (var result = statement.executeQuery("SELECT @@datadir")) {
                assertTrue(result.next());
                assertEquals(java.nio.file.Path.of(expected).toRealPath(), java.nio.file.Path.of(result.getString(1)).toRealPath());
            }
        }
        new TransactionTemplate(transactions).executeWithoutResult(tx -> {
            user = new UserEntity(); user.setFullName("MySQL auth audit");
            user.setEmail(UUID.randomUUID() + "@example.test"); user.setPasswordHash("synthetic-test-hash");
            user.setStatus(UserStatus.ACTIVE);
            var role = em.createQuery("select r from RoleEntity r where r.name = 'STUDENT'", RoleEntity.class).getResultList().get(0);
            user.getRoles().add(role); em.persist(user); em.flush();
        });
        token = jwt.createRefreshToken(user); refresh.register(token);
    }
    @AfterEach void cleanup() {
        new TransactionTemplate(transactions).executeWithoutResult(tx -> {
            em.createQuery("delete from RefreshSessionEntity s where s.user.id = :id").setParameter("id", user.getId()).executeUpdate();
            em.remove(em.find(UserEntity.class, user.getId()));
        });
    }
    @Test void realInnoDbLockAllowsOnlyOneRotation() throws Exception {
        var pool = Executors.newFixedThreadPool(2);
        var ready = new CountDownLatch(2); var start = new CountDownLatch(1);
        Callable<Integer> attempt = () -> {
            ready.countDown(); assertTrue(start.await(5, TimeUnit.SECONDS));
            try { refresh.rotate(token); return 200; }
            catch (ResponseStatusException ex) { return ex.getStatusCode().value(); }
        };
        try {
            var a = pool.submit(attempt); var b = pool.submit(attempt);
            assertTrue(ready.await(5, TimeUnit.SECONDS)); start.countDown();
            assertEquals(Set.of(200, 409), Set.of(a.get(10, TimeUnit.SECONDS), b.get(10, TimeUnit.SECONDS)));
        } finally { pool.shutdownNow(); }
    }
    @Test void reuseRevocationCommitsAndLogoutRevokesRotatedToken() {
        String next = refresh.rotate(token).refreshToken();
        String sid = jwt.parse(token).get("sid", String.class);
        new TransactionTemplate(transactions).executeWithoutResult(tx -> sessions.findById(sid).orElseThrow().setRotatedAt(Instant.now().minusSeconds(6)));
        assertEquals(401, assertThrows(ResponseStatusException.class, () -> refresh.rotate(token)).getStatusCode().value());
        assertTrue(sessions.findById(sid).orElseThrow().isRevoked());
        assertThrows(ResponseStatusException.class, () -> refresh.rotate(next));
        String other = jwt.createRefreshToken(user); refresh.register(other);
        String rotated = refresh.rotate(other).refreshToken();
        refresh.revoke(other);
        assertThrows(ResponseStatusException.class, () -> refresh.rotate(rotated));
    }
}
