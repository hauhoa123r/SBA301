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

export const hasRole = (user, requiredRole) => {
    if (!requiredRole) return Boolean(user);
    return extractRoles(user).includes(normalizeRole(requiredRole));
};

const ROLE_HOME_PATHS = {
    student: "/",
    user: "/",
    teacher: "/management",
    admin: "/admin",
    moderator: "/moderator",
};

const ROLE_PROTECTED_PATHS = [
    { prefix: "/management", role: "teacher" },
    { prefix: "/admin", role: "admin" },
    { prefix: "/moderator", role: "moderator" },
    { prefix: "/payment", role: "student" },
    { prefix: "/learning", role: "student" },
];

const AUTH_PATHS = ["/login", "/register", "/oauth/callback"];

export const getRoleHomePath = (user) => {
    const role = extractRoles(user).find((candidate) => ROLE_HOME_PATHS[candidate]);
    return role ? ROLE_HOME_PATHS[role] : "/";
};

export const getPostLoginPath = (user, requestedPath = "") => {
    const fallback = getRoleHomePath(user);
    if (!requestedPath.startsWith("/") || requestedPath.startsWith("//")) return fallback;

    const pathname = requestedPath.split(/[?#]/, 1)[0];
    if (AUTH_PATHS.includes(pathname)) return fallback;

    const protectedPath = ROLE_PROTECTED_PATHS.find(({ prefix }) =>
        pathname === prefix || pathname.startsWith(`${prefix}/`)
    );

    if (protectedPath && !hasRole(user, protectedPath.role)) return fallback;
    return requestedPath;
};
