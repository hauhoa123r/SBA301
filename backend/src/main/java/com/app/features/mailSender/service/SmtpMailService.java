package com.app.features.mailSender.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "mail.provider", havingValue = "smtp")
public class SmtpMailService implements MailService {
    private final JavaMailSender javaMailSender;
    private final MailTemplateService mailTemplateService;

    @Value("${spring.mail.username:}")
    private String username;

    @Override
    public void sendResetTokenEmail(String userEmail, String token) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String senderEmail = username;
            if (senderEmail != null && !senderEmail.isBlank()) {
                helper.setFrom(senderEmail, "sonnh");
            }
            helper.setTo(userEmail);
            helper.setSubject(mailTemplateService.resetPasswordSubject());
            helper.setText(mailTemplateService.resetPasswordHtml(token), true);

            javaMailSender.send(message);
        } catch (MessagingException | MailException e) {
            throw new RuntimeException("Can not send email, please try again.", e);
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException(e);
        }
    }
}
