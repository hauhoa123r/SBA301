export {
  extractRoles,
  hasAnyRole,
  hasRole,
  normalizeRole,
  toStudentUser,
  toSupportedUser,
  type NormalizedUserRole,
} from "./model/roles";
export { isUser, USER_ROLES } from "./model/user.types";
export type {
  User,
  StudentUser,
  SupportedUser,
  UserPermission,
  UserRole,
  UserRoleCollection,
  UserRoleDescriptor,
  UserRoleSource,
} from "./model/user.types";
