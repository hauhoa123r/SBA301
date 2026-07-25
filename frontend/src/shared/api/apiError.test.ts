import { describe, expect, it } from "vitest";

import {
  DEFAULT_API_ERROR_MESSAGE,
  getApiErrorMessage,
  getApiErrorStatus,
  normalizeApiError,
} from "./apiError";

describe("normalizeApiError", () => {
  it("normalizes a string response body", () => {
    const error = {
      isAxiosError: true,
      response: { status: 400, data: "Invalid request" },
    };

    expect(normalizeApiError(error)).toEqual({
      status: 400,
      message: "Invalid request",
    });
  });

  it("prefers the first validation detail and preserves API metadata", () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 422,
        data: {
          message: "Validation failed",
          data: { email: "Email is invalid", password: "Password is invalid" },
          error: "Unprocessable Entity",
          path: "/api/auth/register",
          timestamp: "2026-07-25T08:00:00Z",
        },
      },
    };

    expect(normalizeApiError(error)).toEqual({
      status: 422,
      message: "Email is invalid",
      error: "Unprocessable Entity",
      path: "/api/auth/register",
      timestamp: "2026-07-25T08:00:00Z",
    });
  });

  it("uses an Error message when no response payload exists", () => {
    expect(getApiErrorMessage(new Error("Network unavailable"))).toBe(
      "Network unavailable",
    );
  });

  it("uses the supplied fallback for an unknown value", () => {
    expect(normalizeApiError(null, "Try again")).toEqual({ message: "Try again" });
    expect(normalizeApiError(undefined).message).toBe(DEFAULT_API_ERROR_MESSAGE);
  });

  it("reads status from Axios-shaped and normalized errors", () => {
    expect(getApiErrorStatus({ response: { status: 403 } })).toBe(403);
    expect(getApiErrorStatus({ status: 409 })).toBe(409);
    expect(getApiErrorStatus("failure")).toBeUndefined();
  });
});
