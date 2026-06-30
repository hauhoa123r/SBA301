package com.app.features.mailSender.service;

import com.app.features.mailSender.dto.EmailRequest;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "mail.provider", havingValue = "resend", matchIfMissing = true)
public class ResendMailService implements MailService {
    private final MailTemplateService mailTemplateService;

    @Value("${resend.api.key}")
    private String apiKey;

    @Value("${resend.from.email}")
    private String fromEmail;

    private RestClient restClient;

    @PostConstruct
    public void init() {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Missing required configuration: resend.api.key");
        }
        if (fromEmail == null || fromEmail.isBlank()) {
            throw new IllegalStateException("Missing required configuration: resend.from.email");
        }
        this.restClient = RestClient.builder().baseUrl("https://api.resend.com").build();
    }

    @Override
    public void sendResetTokenEmail(String userEmail, String token) {
        EmailRequest emailRequest = new EmailRequest(
                fromEmail,
                List.of(userEmail),
                mailTemplateService.resetPasswordSubject(),
                mailTemplateService.resetPasswordHtml(token)
        );

        try {
            this.restClient.post()
                    .uri("/emails")
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(emailRequest)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException e) {
            throw new RuntimeException("Can not send email, please try again.", e);
        }
    }
}
