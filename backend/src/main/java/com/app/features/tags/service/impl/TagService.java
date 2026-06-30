package com.app.features.tags.service.impl;


import com.app.exception.BadRequestException;
import com.app.exception.BaseException;
import com.app.features.model.TagEntity;
import com.app.features.tags.repository.ITagRepository;
import com.app.features.tags.service.ITagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class TagService implements ITagService {
    private final ITagRepository tagRepository;

    @Autowired
    public TagService(ITagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }
    @Override
    public List<TagEntity> findAllById(List<Long> tagIds){
        if(tagIds == null || tagIds.isEmpty()){
            return List.of();
        }
        List <TagEntity> tagEntities = tagRepository.findAllById(tagIds);
        if(tagIds.size() != tagEntities.size()){
            throw new BadRequestException("Có nhãn chưa tồn tại trong hệ thống.");
        }
        return tagEntities;
    }
}
