package com.app.features.mailSender.service;

import org.springframework.stereotype.Component;

@Component
public class MailTemplateService {
    public String resetPasswordSubject() {
        return "Chinese online learning reset token";
    }

    public String resetPasswordHtml(String token) {
        return """
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Password reset token</h2>
                    <p>Use the following token to continue resetting your password:</p>
                    <div style="font-size: 24px; font-weight: 700; letter-spacing: 4px; margin: 16px 0;">%s</div>
                    <p>This token expires in 15 minutes.</p>
                </div>
                """.formatted(token);
    }
}
