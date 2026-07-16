package com.app.features.categories.service.impl;

import com.app.exception.BadRequestException;
import com.app.features.categories.dto.response.CategoryResponse;
import com.app.features.categories.repository.ICategoryRepository;
import com.app.features.categories.service.ICategoryService;
import com.app.features.model.CategoryEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class CategoryService implements ICategoryService {
    private final ICategoryRepository categoryRepository;

    @Autowired
    public CategoryService(ICategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public CategoryEntity findCategoryById(Long categoryId) {
        if(categoryId == null){
            log.warn("Category lookup rejected because categoryId is null");
            throw new BadRequestException("Id của danh mục không thể rỗng.");
        }
        CategoryEntity categoryEntity = categoryRepository.findById(categoryId)
                .orElseThrow(() -> {
                    log.warn("Category not found, categoryId={}", categoryId);
                    return new BadRequestException("Danh mục này không tồn tại.");
                });
        return categoryEntity;
    }
    private CategoryResponse toCategoryResponse(CategoryEntity categoryEntity) {
        CategoryResponse categoryResponse = new CategoryResponse();
        categoryResponse.setId(categoryEntity.getId());
        categoryResponse.setName(categoryEntity.getName());
        return categoryResponse;
    }

    @Override
    public List<CategoryResponse> getAllCategories() {
        List<CategoryEntity> categoryEntities = categoryRepository.findAll();
        if (categoryEntities.isEmpty()) {
            log.warn("Category list is empty");
        }
        log.info("Categories loaded successfully, categoryCount={}", categoryEntities.size());
        return categoryEntities.stream().map(categoryEntity -> toCategoryResponse(categoryEntity)).collect(Collectors.toList());
    }


}
