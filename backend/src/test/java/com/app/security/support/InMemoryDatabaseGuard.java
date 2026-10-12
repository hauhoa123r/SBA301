package com.app.security.support;

import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;

/** Stops bootstrapping before Hibernate can write to a database overridden by host environment variables. */
public class InMemoryDatabaseGuard implements ApplicationContextInitializer<ConfigurableApplicationContext> {
    @Override public void initialize(ConfigurableApplicationContext context) {
        String url = context.getEnvironment().getProperty("spring.datasource.url", "");
        if (!url.startsWith("jdbc:h2:mem:")) {
            throw new IllegalStateException("Security/smoke tests require an in-memory H2 database.");
        }
    }
}
