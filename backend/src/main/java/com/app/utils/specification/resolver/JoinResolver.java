package com.app.utils.specification.resolver;

import jakarta.persistence.criteria.*;

import java.util.Map;

public class JoinResolver {

    private JoinResolver() {}
    public static Path<?> resolvePath(Root<?> root, String field, JoinType joinType, Map<String, Join<?, ?>> joinCache) {
        if (!field.contains(".")) {
            return root.get(field);
        }
        String[] paths = field.split("\\.");
        From<?, ?> current = root;
        StringBuilder joinPath = new StringBuilder();
        for (int i = 0; i < paths.length - 1; i++) {
            if (i > 0) {
                joinPath.append(".");
            }
            joinPath.append(paths[i]);
            String key = joinPath.toString();
            Join<?, ?> join = joinCache.get(key);
            if (join == null) {
                join = current.join(paths[i], joinType);
                joinCache.put(key, join);
            }
            current = join;
        }
        return current.get(paths[paths.length - 1]);
    }
}