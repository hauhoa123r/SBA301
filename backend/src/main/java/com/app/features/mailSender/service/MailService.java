package com.app.features.mailSender.service;

import com.app.features.mailSender.dto.EmailRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;

@Service
public class MailService {
    @Value("${resend.api.key}")
    private String apiKey;
    @Value("${resend.from.email}")
    private String fromEmail;
    private final RestClient restClient = RestClient.create();

    public void sendResetTokenEmail(String userEmail, String token){
        String url = "https://api.resend.com/emails";
        String htmlContent = """
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Password reset token</h2>
                    <p>Use the following token to continue resetting your password:</p>
                    <div style="font-size: 24px; font-weight: 700; letter-spacing: 4px; margin: 16px 0;">%s</div>
                    <p>This token expires in 10 minutes.</p>
                </div>
                """.formatted(token);

        EmailRequest emailRequest = new EmailRequest(
                fromEmail,
                List.of(userEmail),
                "Chinese online learning reset token",
                htmlContent
        );

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Missing Resend API key.");
        }
        if (fromEmail == null || fromEmail.isBlank()) {
            throw new IllegalStateException("Missing sender email address.");
        }

        try {
            restClient.post().uri(url).header("Authorization", "Bearer " + apiKey).contentType(MediaType.APPLICATION_JSON)
                    .body(emailRequest).retrieve().toBodilessEntity();
        } catch (RestClientException e) {
            throw new RuntimeException("Can not send email, please try again.");
        }
    }
}
