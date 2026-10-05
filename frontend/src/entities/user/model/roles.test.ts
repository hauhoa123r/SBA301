import { describe, expect, it } from "vitest";
import type { User } from "./user.types";
import {
  extractRoles,
  hasAnyRole,
  hasRole,
  normalizeRole,
  toStudentUser,
  toSupportedUser,
} from "./roles";

describe("user role helpers", () => {
  it("normalizes ROLE_ prefixes, whitespace and casing", () => {
    expect(normalizeRole("ROLE_STUDENT ")).toBe("student");
    expect(normalizeRole(undefined)).toBe("");
  });

  it("keeps only the supported role from mixed legacy payloads", () => {
    const user: User = {
      role: "ROLE_STUDENT",
      roles: [{ name: "TEACHER" }],
      authority: { authority: "ROLE_MODERATOR" },
      permissions: [{ name: "ADMIN" }],
    };

    expect(extractRoles(user)).toEqual(["student"]);
    expect(toStudentUser(user)).toMatchObject({
      role: "STUDENT",
      roles: ["STUDENT"],
    });
    expect(toStudentUser(user)).not.toHaveProperty("authorities");
    expect(toStudentUser(user)).not.toHaveProperty("permissions");
  });

  it("rejects accounts without the supported STUDENT role", () => {
    expect(toStudentUser({ roles: ["ADMIN"] })).toBeNull();
    expect(toStudentUser({ roles: ["ROLE_MODERATOR"] })).toBeNull();
    expect(toStudentUser({ roles: ["TEACHER"] })).toBeNull();
    expect(toStudentUser({ roles: ["ROLE_INSTRUCTOR"] })).toBeNull();
    expect(toStudentUser({ roles: ["USER"] })).toBeNull();
  });

  it("checks only the supported role", () => {
    const user: User = { roles: ["ROLE_STUDENT"] };

    expect(hasRole(user, "STUDENT")).toBe(true);
    expect(hasAnyRole(user, ["STUDENT"])).toBe(true);
    expect(hasAnyRole(user)).toBe(true);
    expect(hasAnyRole(user, [])).toBe(false);
    expect(hasAnyRole(null)).toBe(false);
  });

  it("accepts admin roles without interpreting permission names as roles", () => {
    expect(toSupportedUser({ roles: ["ROLE_ADMIN", "TEACHER"] })).toMatchObject({ role: "ADMIN", roles: ["ADMIN"] });
    expect(hasRole({ permissions: [{ name: "ADMIN" }] }, "ADMIN")).toBe(false);
    expect(hasRole({ roles: ["STUDENT"] }, "ADMIN")).toBe(false);
  });
});
