package com.app.features.categories.repository;

import com.app.features.courses.repository.ICourseRepository;
import com.app.features.model.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ICateogoryRepository extends JpaRepository<CategoryEntity,Long> {
}
