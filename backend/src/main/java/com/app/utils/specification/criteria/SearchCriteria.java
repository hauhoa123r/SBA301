package com.app.utils.specification.criteria;

import jakarta.persistence.criteria.JoinType;

public record SearchCriteria(String field, OperatorEnum operator, Object value, JoinType joinType) {}