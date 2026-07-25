import { describe, expect, it } from "vitest";
import { getPostLoginPath, getRequestedPath, getRoleHomePath } from "./authRedirect";

describe("auth redirect policy", () => {
  it("uses the public home page for supported sessions", () => {
    expect(getRoleHomePath()).toBe("/");
  });

  it("keeps safe internal paths and rejects external or auth-loop redirects", () => {
    expect(getPostLoginPath("/courses/12?tab=content#lesson")).toBe("/courses/12?tab=content#lesson");
    expect(getPostLoginPath("//external.example")).toBe("/");
    expect(getPostLoginPath("/login")).toBe("/");
  });

  it("reads returnTo from the query before router state and sanitizes both", () => {
    const state = { from: { pathname: "/learning", search: "?course=1", hash: "#study-plan" } };

    expect(getRequestedPath({ search: "?returnTo=%2Fcourses%2F2", state })).toBe("/courses/2");
    expect(getRequestedPath({ search: "", state })).toBe("/learning?course=1#study-plan");
    expect(getRequestedPath({ search: "?returnTo=%2F%2Fevil.example", state })).toBe("");
  });
});
