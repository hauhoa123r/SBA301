package com.app.config;

import com.app.features.mailSender.service.MailService;
import com.app.features.mailSender.service.MailTemplateService;
import com.app.features.mailSender.service.ResendMailService;
import com.app.features.mailSender.service.SmtpMailService;
import com.app.security.jwt.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.AutoConfigurations;
import org.springframework.boot.autoconfigure.mail.MailSenderAutoConfiguration;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.boot.convert.ApplicationConversionService;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.io.support.ResourcePropertySource;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.io.IOException;
import java.io.UncheckedIOException;

import static org.assertj.core.api.Assertions.assertThat;

class DeploymentConfigurationTest {
    private ApplicationContextRunner runner(Map<String, Object> provider) {
        Map<String, Object> env = new HashMap<>(Map.of(
                "DB_URL", "jdbc:mysql://mysql:3306/chinese_online_learning",
                "DB_USERNAME", "chinese_app", "DB_PASSWORD", "test-only",
                "JWT_SECRET", Base64.getEncoder().encodeToString(new byte[32]),
                "CORS_ALLOWED_ORIGINS", "http://192.0.2.1",
                "FRONTEND_VERIFY_EMAIL_URL", "http://192.0.2.1/verify-email",
                "FRONTEND_PAYMENT_RESULT_URL", "http://192.0.2.1/payment/result",
                "OAUTH2_FRONTEND_REDIRECT_URI", "https://example.org/oauth/callback"));
        for (String name : new String[]{"GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET",
                "FACEBOOK_CLIENT_ID", "FACEBOOK_CLIENT_SECRET"}) {
            env.put(name, "test-only");
        }
        env.putAll(provider);
        return new ApplicationContextRunner()
                .withConfiguration(AutoConfigurations.of(MailSenderAutoConfiguration.class))
                .withUserConfiguration(JwtService.class, SmtpMailService.class,
                        ResendMailService.class, MailTemplateService.class)
                .withInitializer(context -> {
                    // ApplicationContextRunner does not install SpringApplication's converters.
                    context.getBeanFactory().setConversionService(ApplicationConversionService.getSharedInstance());
                    context.getEnvironment().getPropertySources().addFirst(new MapPropertySource("test-env", env));
                    ResourcePropertySource properties;
                    try {
                        properties = new ResourcePropertySource("classpath:application.properties");
                    } catch (IOException exception) {
                        throw new UncheckedIOException(exception);
                    }
                    context.getEnvironment().getPropertySources().addLast(properties);
                    // Resolve every application property, including placeholders outside these beans.
                    for (String name : properties.getPropertyNames()) {
                        context.getEnvironment().getRequiredProperty(name);
                    }
                });
    }

    @Test
    void smtpStartsWithoutResendCredentialsOrExplicitJwtTtls() {
        runner(Map.of("MAIL_PROVIDER", "smtp", "SMTP_USERNAME", "test@example.org",
                "SMTP_PASSWORD", "test-only")).run(context -> {
            assertThat(context).hasNotFailed().hasSingleBean(JwtService.class).hasSingleBean(MailService.class);
            assertThat(context.getBean(MailService.class)).isInstanceOf(SmtpMailService.class);
            assertThat(context.getEnvironment().getProperty("app.jwt.access-ttl")).isEqualTo("PT15M");
            assertThat(context.getEnvironment().getProperty("app.jwt.refresh-ttl")).isEqualTo("P30D");
        });
    }

    @Test
    void resendStartsWithoutSmtpCredentials() {
        runner(Map.of("MAIL_PROVIDER", "resend", "RESEND_API_KEY", "test-only",
                "RESEND_FROM_EMAIL", "test@example.org")).run(context -> {
            assertThat(context).hasNotFailed().hasSingleBean(MailService.class);
            assertThat(context.getBean(MailService.class)).isInstanceOf(ResendMailService.class);
        });
    }
}
