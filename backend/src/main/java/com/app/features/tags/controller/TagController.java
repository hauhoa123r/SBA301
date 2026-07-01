package com.app.features.tags.controller;

import com.app.features.tags.dto.response.TagResponse;
import com.app.features.tags.service.ITagService;
import com.app.utils.ApiPath;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping(ApiPath.API_TAGS)
@RequiredArgsConstructor
public class TagController {
    private final ITagService tagService;

    @GetMapping
    public ResponseEntity<List<TagResponse>> getAllTags() {
        return ResponseEntity.ok().body(tagService.getAllTags());
    }
}
