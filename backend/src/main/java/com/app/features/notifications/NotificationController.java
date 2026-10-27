package com.app.features.notifications;

import com.app.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/notifications") @RequiredArgsConstructor
@PreAuthorize("hasAnyRole('STUDENT','ADMIN')")
public class NotificationController {
    private final NotificationService service;
    private final RecommendationService recommendations;
    @GetMapping("/recommendation") @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<NotificationService.Daily> recommendation(Authentication auth) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(new NotificationService.Daily(recommendations.next(CurrentUser.id(auth)),false));
    }
    @GetMapping public ResponseEntity<NotificationService.Inbox> inbox(Authentication auth, @RequestParam(defaultValue="0") int page) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.inbox(CurrentUser.id(auth),page));
    }
    @PutMapping("/{id}/read") public ResponseEntity<Void> read(Authentication auth, @PathVariable Long id) {
        service.read(CurrentUser.id(auth),id); return ResponseEntity.noContent().cacheControl(CacheControl.noStore()).build();
    }
    @PutMapping("/read") public ResponseEntity<Void> readAll(Authentication auth) {
        service.readAll(CurrentUser.id(auth)); return ResponseEntity.noContent().cacheControl(CacheControl.noStore()).build();
    }
    @PostMapping("/daily-study") @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<NotificationService.Daily> daily(Authentication auth) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.daily(CurrentUser.id(auth)));
    }
}
