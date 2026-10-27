package com.app.features.contact.controller;

import com.app.features.contact.dto.ContactDto.*;
import com.app.features.contact.service.ContactService;
import com.app.security.ratelimit.AuthenticationAttemptLimiter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.Duration;

@RestController @RequestMapping("/api/contact") @RequiredArgsConstructor
public class ContactController {
    private final ContactService service;
    // Keep public contact quotas separate from login quotas and their bounded key store.
    private final AuthenticationAttemptLimiter attempts = new AuthenticationAttemptLimiter();

    @PostMapping
    public ResponseEntity<Receipt> submit(@Valid @RequestBody Submit body, HttpServletRequest request,
            org.springframework.security.core.Authentication authentication) {
        try {
            // RemoteAddr is resolved by the same trusted proxy configuration as authentication requests.
            attempts.check("contact-ip", request.getRemoteAddr(), 5, Duration.ofMinutes(10));
            attempts.check("contact-global", "all", 100, Duration.ofMinutes(1));
        } catch (ResponseStatusException ex) {
            if (ex.getStatusCode().value() != 429) throw ex;
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).cacheControl(CacheControl.noStore())
                .header(HttpHeaders.RETRY_AFTER, "600").build();
        }
        Long userId = com.app.security.CurrentUser.optionalId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).cacheControl(CacheControl.noStore())
            .body(userId==null ? service.submit(body) : service.submit(body,userId));
    }
}
