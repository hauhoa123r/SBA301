import { describe, expect, it } from "vitest";
import { resolveRouteAccess } from "./routeAccess";

describe("resolveRouteAccess", () => {
    it("restricts the dashboard to admins and keeps student routes restricted", () => {
        expect(resolveRouteAccess(null, "ADMIN")).toBe("login");
        expect(resolveRouteAccess({ roles: ["STUDENT"] }, "ADMIN")).toBe("forbidden");
        expect(resolveRouteAccess({ roles: ["ROLE_ADMIN"] }, "ADMIN")).toBe("allow");
        expect(resolveRouteAccess({ roles: ["ADMIN"] }, "STUDENT")).toBe("forbidden");
    });
    it("redirects anonymous visitors to login", () => {
        expect(resolveRouteAccess(null)).toBe("login");
    });

    it("allows a supported student when no explicit role is required", () => {
        expect(resolveRouteAccess({ roles: ["ROLE_STUDENT"] })).toBe("allow");
    });

    it("rejects an object without the supported role", () => {
        expect(resolveRouteAccess({ id: 1 })).toBe("forbidden");
    });

    it("rejects a legacy-only backend role", () => {
        expect(resolveRouteAccess({ roles: [{ name: "ROLE_TEACHER" }] })).toBe("forbidden");
    });

    it("allows a user with a normalized STUDENT backend role", () => {
        expect(resolveRouteAccess({ roles: [{ name: "ROLE_STUDENT" }] }, "STUDENT")).toBe("allow");
    });
});
