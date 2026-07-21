export const normalizeRole = (role) =>
    String(role || "")
        .replace(/^ROLE_/i, "")
        .trim()
        .toLowerCase();

export const extractRoles = (user) => {
    if (!user) return [];

    const roleSources = [
        user.role,
        user.roles,
        user.authority,
        user.authorities,
        user.permission,
        user.permissions,
    ];

    return roleSources
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .map((value) => {
            if (typeof value === "object" && value !== null) {
                return value.role || value.name || value.authority;
            }

            return value;
        })
        .map(normalizeRole)
        .filter(Boolean);
};

export const hasAnyRole = (user, allowedRoles = []) => {
    const acceptedRoles = allowedRoles.map(normalizeRole);
    if (acceptedRoles.length === 0) return Boolean(user);
    return extractRoles(user).some((role) => acceptedRoles.includes(role));
};
