package com.app.features.tags.service;

import com.app.features.model.TagEntity;
import com.app.features.tags.dto.response.TagResponse;

import java.util.List;

public interface ITagService {
    public List<TagEntity> findAllById(List<Long> tagIds);

    public List<TagResponse> getAllTags();
}
