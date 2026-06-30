package com.app.features.tags.service;

import com.app.features.model.TagEntity;

import java.util.List;

public interface ITagService {
    public List<TagEntity> findAllById(List<Long> tagIds);
}
