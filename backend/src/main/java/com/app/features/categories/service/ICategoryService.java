package com.app.features.categories.service;

import com.app.features.model.CategoryEntity;

public interface ICategoryService {
    public CategoryEntity findCategoryById(Long categoryId);
}
