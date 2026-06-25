package com.app.utils.specification.annotation;

import com.app.utils.specification.criteria.OperatorEnum;
import jakarta.persistence.criteria.JoinType;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface SearchField {
    String entityField() default "";
    OperatorEnum operator() default OperatorEnum.EQUAL;
    JoinType joinType() default JoinType.INNER;
}