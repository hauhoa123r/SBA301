package com.app.features.subscriptions;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.time.Clock;

@Configuration
public class SubscriptionConfiguration {
    @Bean
    public Clock subscriptionClock() {
        return Clock.systemUTC();
    }
}
