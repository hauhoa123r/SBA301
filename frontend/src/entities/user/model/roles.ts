import type {
  StudentUser,
  SupportedUser,
  User,
  UserRole,
  UserRoleCollection,
  UserRoleDescriptor,
  UserRoleSource,
} from "./user.types";
import { isUser, USER_ROLES } from "./user.types";

const ROLE_SOURCE_KEYS = [
  "role",
  "roles",
  "authority",
  "authorities",
] as const;

function isRoleDescriptor(value: unknown): value is UserRoleDescriptor {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRoleSourceArray(value: UserRoleCollection): value is readonly UserRoleSource[] {
  return Array.isArray(value);
}

function toRoleSources(value: UserRoleCollection): readonly UserRoleSource[] {
  return isRoleSourceArray(value) ? value : [value];
}

function readRoleName(value: UserRoleSource): unknown {
  if (!isRoleDescriptor(value)) return value;
  if (value.role) return value.role;
  if (value.name) return value.name;
  return value.authority;
}

export const normalizeRole = (role: unknown): string => {
  const roleText = typeof role === "string" || typeof role === "number" ? String(role) : "";
  return roleText
    .replace(/^ROLE_/i, "")
    .trim()
    .toLowerCase();
};

export type NormalizedUserRole = Lowercase<UserRole>;

const SUPPORTED_ROLES = new Set<string>(USER_ROLES.map(normalizeRole));

function isSupportedRole(role: string): role is NormalizedUserRole {
  return SUPPORTED_ROLES.has(role);
}

export const extractRoles = (user: unknown): NormalizedUserRole[] => {
  if (!isUser(user)) return [];

  return ROLE_SOURCE_KEYS.flatMap((key) => toRoleSources(user[key]))
    .map(readRoleName)
    .map(normalizeRole)
    .filter(isSupportedRole);
};

export const hasAnyRole = (
  user: User | null | undefined,
  allowedRoles: readonly UserRole[] = USER_ROLES,
): boolean => {
  const acceptedRoles = allowedRoles.map(normalizeRole);
  if (acceptedRoles.length === 0) return false;
  return extractRoles(user).some((role) => acceptedRoles.includes(role));
};

export const hasRole = (
  user: User | null | undefined,
  requiredRole: UserRole = "STUDENT",
): boolean => {
  const normalizedRole = normalizeRole(requiredRole);
  return (
    isSupportedRole(normalizedRole) &&
    extractRoles(user).includes(normalizedRole)
  );
};

export function toStudentUser(value: unknown): StudentUser | null {
  if (!isUser(value) || !hasRole(value, "STUDENT")) return null;

  const studentUser: StudentUser = {
    ...value,
    role: "STUDENT",
    roles: ["STUDENT"],
  };

  delete studentUser.authority;
  delete studentUser.authorities;
  delete studentUser.permission;
  delete studentUser.permissions;

  return studentUser;
}

export function toSupportedUser(value: unknown): SupportedUser | null {
  if (!isUser(value)) return null;
  const roles = [...new Set(extractRoles(value))].map((role) => role.toUpperCase() as UserRole);
  if (!roles.length) return null;
  const user: SupportedUser = { ...value, role: roles.includes("ADMIN") ? "ADMIN" : "STUDENT", roles };
  delete user.authority;
  delete user.authorities;
  delete user.permission;
  delete user.permissions;
  return user;
}
