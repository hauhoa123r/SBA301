package com.app.features.contact.controller;

import com.app.features.contact.dto.ContactDto.*;
import com.app.features.contact.dto.ContactCategory;
import com.app.features.contact.model.ContactMessage.Status;
import com.app.features.contact.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/admin/contact-messages")
@PreAuthorize("hasRole('ADMIN')") @RequiredArgsConstructor
public class AdminContactController {
    private final ContactService service;
    private final com.app.features.contact.service.ContactReplyService replies;

    @PutMapping("/{id}/reply")
    public ResponseEntity<Item> reply(@PathVariable Long id, @Valid @RequestBody Reply body,
            org.springframework.security.core.Authentication authentication) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
            .body(replies.reply(id, com.app.security.CurrentUser.id(authentication), body.text()));
    }
    @GetMapping
    public ResponseEntity<Inbox> inbox(@RequestParam(required = false) Status status, @RequestParam(required = false) ContactCategory category,
            @RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.inbox(status, category, page));
    }
    @GetMapping("/statistics")
    public ResponseEntity<Statistics> statistics() {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.statistics());
    }
    @PatchMapping("/{id}/status")
    public ResponseEntity<Item> status(@PathVariable Long id, @Valid @RequestBody UpdateStatus body) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.updateStatus(id, body.status()));
    }
}
