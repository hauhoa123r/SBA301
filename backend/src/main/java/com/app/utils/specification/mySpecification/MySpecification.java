package com.app.utils.specification.mySpecification;

import com.app.utils.specification.builder.PredicateBuilder;
import com.app.utils.specification.builder.SearchCriteriaBuilder;
import com.app.utils.specification.criteria.SearchCriteria;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MySpecification<T> implements Specification<T> {
    private final Object dto;
    public MySpecification(Object dto) {
        this.dto = dto;
    }
    @Override
    public Predicate toPredicate(Root<T> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
        List<SearchCriteria> criteriaList = SearchCriteriaBuilder.build(dto);
        Map<String, Join<?, ?>> joinCache = new HashMap<>();
        List<Predicate> predicates = criteriaList.stream().map(criteria -> PredicateBuilder.build(criteria, root, cb, joinCache)).toList();
        return cb.and(predicates.toArray(new Predicate[0]));
    }
}