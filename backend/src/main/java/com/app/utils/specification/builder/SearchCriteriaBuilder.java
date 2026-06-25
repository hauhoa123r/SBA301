package com.app.utils.specification.builder;

import com.app.utils.specification.annotation.SearchField;
import com.app.utils.specification.criteria.SearchCriteria;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;

public class SearchCriteriaBuilder {

    private SearchCriteriaBuilder(){}

    public static List<SearchCriteria> build(Object dto) {
        List<SearchCriteria> criteriaList = new ArrayList<>();
        try {
            for (Field field : dto.getClass().getDeclaredFields()) {
                field.setAccessible(true);
                Object value = field.get(dto);
                if (value == null) {
                    continue;
                }
                SearchField annotation = field.getAnnotation(SearchField.class);
                if (annotation == null) {
                    continue;
                }
                String entityField = annotation.entityField().isBlank() ? field.getName() : annotation.entityField();
                criteriaList.add(new SearchCriteria(entityField, annotation.operator(), value, annotation.joinType()));
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return criteriaList;
    }
}