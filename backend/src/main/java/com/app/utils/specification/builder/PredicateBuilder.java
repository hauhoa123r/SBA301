package com.app.utils.specification.builder;

import com.app.utils.specification.criteria.OperatorEnum;
import com.app.utils.specification.criteria.SearchCriteria;
import com.app.utils.specification.resolver.JoinResolver;
import jakarta.persistence.criteria.*;

import java.util.Collection;
import java.util.Map;

@SuppressWarnings({"rawtypes", "unchecked"})
public class PredicateBuilder {

    private PredicateBuilder(){}

    public static Predicate build(SearchCriteria criteria, Root<?> root, CriteriaBuilder cb, Map<String, Join<?, ?>> joinCache) {
        Path<?> path = JoinResolver.resolvePath(root, criteria.field(), criteria.joinType(), joinCache);
        return switch (criteria.operator()) {
            case EQUAL -> cb.equal(path, criteria.value());
            case LIKE -> cb.like(cb.lower(path.as(String.class)), "%" + criteria.value().toString().toLowerCase() + "%");
            case GREATER_THAN -> cb.greaterThan((Expression<Comparable>) path, (Comparable) criteria.value());
            case LESS_THAN -> cb.lessThan((Expression<Comparable>) path, (Comparable) criteria.value());
            case GREATER_THAN_EQUAL -> cb.greaterThanOrEqualTo((Expression<Comparable>) path, (Comparable) criteria.value());
            case LESS_THAN_EQUAL -> cb.lessThanOrEqualTo((Expression<Comparable>) path, (Comparable) criteria.value());
            case IN -> {
                if (!(criteria.value() instanceof Collection<?> values)) {
                    throw new IllegalArgumentException("IN requires Collection");
                }
                yield path.in(values);
            }
            case BETWEEN -> {
                if (!(criteria.value() instanceof Object[] values) || values.length != 2) {
                    throw new IllegalArgumentException("BETWEEN requires Object[2]");
                }
                yield cb.between((Expression<Comparable>) path, (Comparable) values[0], (Comparable) values[1]
                );
            }
        };
    }
}