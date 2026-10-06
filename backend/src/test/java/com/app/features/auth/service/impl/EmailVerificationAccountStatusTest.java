package com.app.features.auth.service.impl;

import com.app.features.auth.repository.UserRepository;
import com.app.features.auth.service.VerificationTokenService;
import com.app.features.mailSender.service.MailService;
import com.app.features.model.*;
import com.app.features.model.enums.UserStatus;
import org.junit.jupiter.api.Test;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmailVerificationAccountStatusTest {
    @Test void oldLinkDoesNotUnlockDisabledUser() {
        var tokens = mock(VerificationTokenService.class); var users = mock(UserRepository.class);
        var service = new EmailVerificationServiceImpl(tokens, users, mock(MailService.class));
        var user = new UserEntity(); user.setId(5L); user.setStatus(UserStatus.DISABLE);
        var token = new VerificationTokenEntity(); token.setUser(user);
        when(tokens.findValidToken("token", "EMAIL_VERIFY", "test@example.test")).thenReturn(Optional.of(token));
        when(users.findById(5L)).thenReturn(Optional.of(user));
        assertFalse(service.verifyEmail("test@example.test", "token")); verify(tokens, never()).markUsed(any());
    }
    @Test void pendingAccountActivationConsumesValidToken() {
        var tokens = mock(VerificationTokenService.class); var users = mock(UserRepository.class);
        var service = new EmailVerificationServiceImpl(tokens, users, mock(MailService.class));
        var user = new UserEntity(); user.setId(5L); user.setStatus(UserStatus.PENDING);
        var token = new VerificationTokenEntity(); token.setUser(user);
        when(tokens.findValidToken("token", "EMAIL_VERIFY", "test@example.test")).thenReturn(Optional.of(token));
        when(users.activatePending(5L)).thenReturn(1);
        assertTrue(service.verifyEmail("test@example.test", "token")); verify(tokens).markUsed(token);
    }
}
