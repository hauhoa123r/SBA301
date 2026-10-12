package com.app.security.ratelimit;

import com.app.security.handler.SecurityErrorResponseWriter;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.*;
import java.util.concurrent.atomic.AtomicInteger;
import static org.junit.jupiter.api.Assertions.*;

class AuthenticationRateLimitFilterTest {
    @Test void excessiveRequestsAreRejectedBeforeControllerAndHeaderSpoofingDoesNotResetBudget() throws Exception {
        var filter = new AuthenticationRateLimitFilter(new AuthenticationAttemptLimiter(),
            new SecurityErrorResponseWriter(new ObjectMapper()));
        var called = new AtomicInteger();
        for (int attempt = 0; attempt < 61; attempt++) {
            var request = new MockHttpServletRequest("POST", "/api/auth/login");
            request.setRemoteAddr("127.0.0.1"); request.addHeader("X-Forwarded-For", "192.0.2." + attempt);
            var response = new MockHttpServletResponse();
            filter.doFilter(request, response, (req, res) -> called.incrementAndGet());
            if (attempt == 60) { assertEquals(429, response.getStatus()); assertEquals("60", response.getHeader("Retry-After")); }
        }
        assertEquals(60, called.get());
    }
}
