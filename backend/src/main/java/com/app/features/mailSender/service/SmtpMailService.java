package com.app.features.mailSender.service;

import jakarta.annotation.PostConstruct;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;

@Service
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "mail.provider", havingValue = "smtp", matchIfMissing = true)
public class SmtpMailService implements MailService {
    private final JavaMailSender javaMailSender;
    private final MailTemplateService mailTemplateService;

    @Value("${mail.from.email:${spring.mail.username:}}")
    private String fromEmail;

    @Value("${mail.from.name:Chinese Online Learning}")
    private String fromName;

    @PostConstruct
    public void init() {
        if (fromEmail == null || fromEmail.isBlank()) {
            throw new IllegalStateException("Missing required configuration: mail.from.email or spring.mail.username");
        }
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
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);

            javaMailSender.send(mimeMessage);
            log.info("Email sent successfully via SMTP, recipient={}", to);
        } catch (MessagingException | MailException e) {
            log.error("Failed to send email via SMTP, recipient={}", to, e);
            throw new RuntimeException("Can not send email, please try again.", e);
        } catch (UnsupportedEncodingException e) {
            log.error("Invalid SMTP sender display name, recipient={}", to, e);
            throw new RuntimeException("Invalid sender display name.", e);
        }
    }
}
