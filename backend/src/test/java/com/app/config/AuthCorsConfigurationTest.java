package com.app.config;

import com.app.config.properties.CorsProperties;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.mock.web.MockHttpServletRequest;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

class AuthCorsConfigurationTest {
    private CorsConfig config(List<String> origins) { return new CorsConfig(new CorsProperties(origins, List.of("GET", "POST"))); }
    @ParameterizedTest
    @ValueSource(strings = {"*", "https://*.example.test", "null", "", " ", "https://ui.test/", "https://ui.test/path", "https://ui.test?x=y", "https://ui.test#fragment", "https://user@ui.test", "file://ui.test", "https://ui.test:99999"})
    void invalidCredentialedOriginsFailFast(String origin) {
        assertThrows(IllegalArgumentException.class, () -> config(List.of(origin)).corsConfigurationSource());
    }
    @Test void emptyAndNullOriginsAreRejected() {
        assertThrows(IllegalArgumentException.class, () -> config(null).corsConfigurationSource());
        assertThrows(IllegalArgumentException.class, () -> config(List.of()).corsConfigurationSource());
        assertThrows(IllegalArgumentException.class, () -> config(Arrays.asList((String) null)).corsConfigurationSource());
    }
    @Test void explicitOriginsRetainCredentialedCorsWithoutWildcard() {
        var cors = config(List.of("https://ui.test", "http://localhost:5173")).corsConfigurationSource()
                .getCorsConfiguration(new MockHttpServletRequest("POST", "/api/auth/refresh"));
        assertNotNull(cors); assertEquals(Boolean.TRUE, cors.getAllowCredentials());
        assertEquals("https://ui.test", cors.checkOrigin("https://ui.test"));
        assertNull(cors.checkOrigin("https://attacker.test"));
    }
}
