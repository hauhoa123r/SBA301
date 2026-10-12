package com.app.security.ratelimit;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import java.time.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import static org.junit.jupiter.api.Assertions.*;

class AuthenticationAttemptLimiterTest {
    @Test void normalizesAccountAndSeparatesOperations() {
        var limiter = new AuthenticationAttemptLimiter();
        limiter.check("login", " Alice@Example.test ", 1, Duration.ofMinutes(1));
        assertEquals(429, assertThrows(ResponseStatusException.class,
            () -> limiter.check("login", "alice@example.test", 1, Duration.ofMinutes(1))).getStatusCode().value());
        assertDoesNotThrow(() -> limiter.check("reset", "alice@example.test", 1, Duration.ofMinutes(1)));
    }
    @Test void fixedWindowExpiresUsingClockWithoutSleeping() {
        var clock = new MutableClock(); var limiter = new AuthenticationAttemptLimiter(clock);
        limiter.check("reset", "alice", 1, Duration.ofMinutes(15));
        assertThrows(ResponseStatusException.class, () -> limiter.check("reset", "alice", 1, Duration.ofMinutes(15)));
        clock.now = clock.now.plusSeconds(900);
        assertDoesNotThrow(() -> limiter.check("reset", "alice", 1, Duration.ofMinutes(15)));
    }
    @Test void parallelGuessesCannotExceedAttemptBudget() throws Exception {
        var limiter = new AuthenticationAttemptLimiter(); var successes = new AtomicInteger();
        var executor = Executors.newFixedThreadPool(8);
        try {
            var tasks = new java.util.ArrayList<Callable<Void>>();
            for (int i = 0; i < 40; i++) tasks.add(() -> {
                try { limiter.check("reset", "alice", 5, Duration.ofMinutes(15)); successes.incrementAndGet(); }
                catch (ResponseStatusException exception) { assertEquals(429, exception.getStatusCode().value()); }
                return null;
            });
            for (var result : executor.invokeAll(tasks)) result.get();
            assertEquals(5, successes.get());
        } finally { executor.shutdownNow(); }
    }
    private static class MutableClock extends Clock {
        Instant now = Instant.parse("2026-01-01T00:00:00Z");
        public ZoneId getZone() { return ZoneOffset.UTC; }
        public Clock withZone(ZoneId zone) { return this; }
        public Instant instant() { return now; }
    }
}
