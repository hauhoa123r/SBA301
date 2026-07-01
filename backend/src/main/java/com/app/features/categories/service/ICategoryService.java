package com.app.features.categories.service;

import com.app.features.categories.dto.response.CategoryResponse;
import com.app.features.model.CategoryEntity;

import java.util.List;

public interface ICategoryService {
    public CategoryEntity findCategoryById(Long categoryId);

    public List<CategoryResponse> getAllCategories();
}
