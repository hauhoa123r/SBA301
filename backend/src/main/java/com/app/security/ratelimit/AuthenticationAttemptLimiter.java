package com.app.security.ratelimit;

import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Locale;

public class AuthenticationAttemptLimiter {
    private static final int MAX_KEYS = 10000;
    private final Clock clock;
    private final Map<String, Counter> counters = new HashMap<>();
    public AuthenticationAttemptLimiter() { this(Clock.systemUTC()); }
    AuthenticationAttemptLimiter(Clock clock) { this.clock = clock; }
    private record Counter(Instant expires, int attempts) {}

    public synchronized void check(String operation, String account, int limit, Duration window) {
        String normalized = account == null ? "" : account.trim().toLowerCase(Locale.ROOT);
        if (normalized.length() > 254) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid account.");
        String key = operation + ":" + normalized;
        Instant now = clock.instant();
        Counter counter = counters.get(key);
        if (counter == null || !counter.expires().isAfter(now)) {
            if (counter == null && counters.size() >= MAX_KEYS) {
                counters.entrySet().removeIf(entry -> !entry.getValue().expires().isAfter(now));
                if (counters.size() >= MAX_KEYS) throw limited();
            }
            counter = new Counter(now.plus(window), 0);
        }
        if (counter.attempts() >= limit) throw limited();
        counters.put(key, new Counter(counter.expires(), counter.attempts() + 1));
    }
    private ResponseStatusException limited() {
        return new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Too many authentication attempts. Try again later.");
    }
}
