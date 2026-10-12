package com.app.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("security-test")
@org.springframework.test.context.ContextConfiguration(initializers = com.app.security.support.InMemoryDatabaseGuard.class)
class BackendApplicationTests {

    @Test
    void contextLoads() {
    }

}
