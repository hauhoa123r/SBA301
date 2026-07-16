package com.app.features.tags.service.impl;


import com.app.exception.BadRequestException;
import com.app.exception.BaseException;
import com.app.features.model.TagEntity;
import com.app.features.tags.dto.response.TagResponse;
import com.app.features.tags.repository.ITagRepository;
import com.app.features.tags.service.ITagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class TagService implements ITagService {
    private final ITagRepository tagRepository;

    @Autowired
    public TagService(ITagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }
    @Override
    public List<TagEntity> findAllById(List<Long> tagIds){
        if(tagIds == null || tagIds.isEmpty()){
            log.debug("Tag lookup skipped because tagIds is empty");
            return List.of();
        }
        List <TagEntity> tagEntities = tagRepository.findAllById(tagIds);
        if(tagIds.size() != tagEntities.size()){
            log.warn("One or more tags were not found, requestedCount={}, foundCount={}", tagIds.size(), tagEntities.size());
            throw new BadRequestException("Có nhãn chưa tồn tại trong hệ thống.");
        }
        return tagEntities;
    }
    private TagResponse toTagResponse(TagEntity tagEntity){
        TagResponse tagResponse = new TagResponse();
        tagResponse.setId(tagEntity.getId());
        tagResponse.setName(tagEntity.getName());
        return tagResponse;
    }

    @Override
    public List<TagResponse> getAllTags() {
        List<TagEntity> tagEntities = tagRepository.findAll();
        if (tagEntities.isEmpty()) {
            log.warn("Tag list is empty");
        }
        log.info("Tags loaded successfully, tagCount={}", tagEntities.size());
        return tagEntities.stream().map(tagEntity -> toTagResponse(tagEntity)).collect(Collectors.toList());
    }
}
