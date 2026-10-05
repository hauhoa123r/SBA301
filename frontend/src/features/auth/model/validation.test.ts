import { describe, expect, it } from "vitest";
import {
  validateEmail,
  validateLoginField,
  validatePassword,
  validateResetPassword,
  validateResetPasswordToken,
  validateToken,
} from "./validation";

describe("auth validation", () => {
  it("lets the server verify existing passwords without changing new-password rules", () => {
    expect(validateLoginField("password", "123456")).toBe("");
    expect(validateLoginField("password", "")).not.toBe("");
    expect(validatePassword("123456")).not.toBe("");
  });
  it("keeps the existing email, password and token constraints", () => {
    expect(validateEmail(" learner@example.com ")).toBe("");
    expect(validateEmail("invalid")).not.toBe("");
    expect(validatePassword("StrongPass1")).toBe("");
    expect(validatePassword("lowercase1")).not.toBe("");
    expect(validateToken("123456")).toBe("");
    expect(validateToken("12345")).not.toBe("");
  });

  it("validates reset state and matching passwords", () => {
    expect(validateResetPasswordToken("learner@example.com", "123456")).toBe("");
    expect(validateResetPasswordToken("", "123456")).not.toBe("");
    expect(validateResetPassword("StrongPass1", "StrongPass1")).toBe("");
    expect(validateResetPassword("StrongPass1", "StrongPass2")).not.toBe("");
  });
});
