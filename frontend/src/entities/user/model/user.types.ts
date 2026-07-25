export const USER_ROLES = ["STUDENT"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface UserPermission {
  id?: number;
  name?: string;
  code?: string;
}

export interface UserRoleDescriptor {
  id?: number;
  role?: string;
  name?: string;
  authority?: string;
  description?: string;
  permissions?: readonly UserPermission[];
}

export type UserRoleSource = string | UserRoleDescriptor | null | undefined;
export type UserRoleCollection = UserRoleSource | readonly UserRoleSource[];

export interface User {
  id?: number | string;
  fullName?: string;
  name?: string;
  username?: string;
  email?: string;
  avatar?: string;
  avatarUrl?: string;
  image?: string;
  role?: UserRoleCollection;
  roles?: UserRoleCollection;
  authority?: UserRoleCollection;
  authorities?: UserRoleCollection;
  permission?: UserRoleCollection;
  permissions?: UserRoleCollection;
  [key: string]: unknown;
}

export interface StudentUser extends User {
  role: "STUDENT";
  roles: readonly ["STUDENT"];
}

export function isUser(value: unknown): value is User {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
