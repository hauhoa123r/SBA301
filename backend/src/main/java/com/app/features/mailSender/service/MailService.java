package com.app.features.mailSender.service;

public interface MailService {
    void sendResetTokenEmail(String userEmail, String token);
}
