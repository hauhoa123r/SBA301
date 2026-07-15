package com.app.features.mailSender.service;

import com.app.features.mailSender.dto.EmailRequest;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestClientException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "mail.provider", havingValue = "resend")
public class ResendMailService implements MailService {
    private final MailTemplateService mailTemplateService;

    @Value("${resend.api.key:}")
    private String apiKey;

    @Value("${resend.from.email:}")
    private String fromEmail;

    @Value("${resend.base-url:https://api.resend.com}")
    private String baseUrl;

    private RestClient restClient;

    @PostConstruct
    public void init() {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Missing required configuration: resend.api.key");
        }
        if (fromEmail == null || fromEmail.isBlank()) {
            throw new IllegalStateException("Missing required configuration: resend.from.email");
        }
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    @Override
    public void sendResetTokenEmail(String userEmail, String token) {
        sendEmail(
                userEmail,
                mailTemplateService.resetPasswordSubject(),
                mailTemplateService.resetPasswordHtml(token)
        );
    }

    @Override
    public void sendVerifyEmail(String userEmail, String verificationURL) {
        sendEmail(
                userEmail,
                mailTemplateService.verifyAccountSubject(),
                mailTemplateService.verifyAccountHtml(verificationURL)
        );
    }

    private void sendEmail(String to, String subject, String html) {
        EmailRequest emailRequest = new EmailRequest(
                fromEmail,
                List.of(to),
                subject,
                html
        );

        try {
            this.restClient.post()
                    .uri("/emails")
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(emailRequest)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientResponseException e) {
            log.warn("Resend rejected email, recipient={}, status={}", to, e.getStatusCode());
            throw new RuntimeException("Can not send email, please try again.", e);
        } catch (RestClientException e) {
            log.warn("Resend email request failed, recipient={}", to);
            throw new RuntimeException("Can not send email, please try again.", e);
        }
    }
}
