export {
  extractRoles,
  hasAnyRole,
  hasRole,
  normalizeRole,
  toStudentUser,
  type NormalizedUserRole,
} from "./model/roles";
export { isUser, USER_ROLES } from "./model/user.types";
export type {
  User,
  StudentUser,
  UserPermission,
  UserRole,
  UserRoleCollection,
  UserRoleDescriptor,
  UserRoleSource,
} from "./model/user.types";
