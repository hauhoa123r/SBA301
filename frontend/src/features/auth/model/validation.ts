const ERROR_MESSAGES = {
  EMAIL_REQUIRED: "Vui lòng nhập email.",
  EMAIL_INVALID: "Vui lòng nhập địa chỉ email hợp lệ.",
  PASSWORD_REQUIRED: "Vui lòng nhập mật khẩu.",
  PASSWORD_LENGTH: "Mật khẩu phải có ít nhất 8 ký tự.",
  PASSWORD_UPPERCASE: "Mật khẩu phải có ít nhất một chữ cái viết hoa.",
  TOKEN_REQUIRED: "Vui lòng nhập mã xác minh.",
  TOKEN_INVALID: "Mã xác minh phải gồm 6 chữ số.",
  INVALID_RESET_SESSION: "Phiên đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.",
  CONFIRM_PASSWORD_NOT_MATCH: "Mật khẩu mới và xác nhận mật khẩu không khớp.",
} as const;

export type AuthFieldName = "email" | "password";

export const validateEmail = (email?: string): string => {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const normalizedEmail = email?.trim() ?? "";
  if (!normalizedEmail) return ERROR_MESSAGES.EMAIL_REQUIRED;
  if (!emailRegex.test(normalizedEmail)) return ERROR_MESSAGES.EMAIL_INVALID;
  return "";
};

export const validatePassword = (password?: string): string => {
  if (!password) return ERROR_MESSAGES.PASSWORD_REQUIRED;
  if (password.length < 8) return ERROR_MESSAGES.PASSWORD_LENGTH;
  if (!/[A-Z]/.test(password)) return ERROR_MESSAGES.PASSWORD_UPPERCASE;
  return "";
};

export const validateToken = (token?: string): string => {
  const normalizedToken = token?.trim() ?? "";
  if (!normalizedToken) return ERROR_MESSAGES.TOKEN_REQUIRED;
  if (!/^\d{6}$/.test(normalizedToken)) return ERROR_MESSAGES.TOKEN_INVALID;
  return "";
};

export const validateResetPasswordToken = (email?: string, token?: string): string => {
  if (validateEmail(email) || validateToken(token)) return ERROR_MESSAGES.INVALID_RESET_SESSION;
  return "";
};

export const validateResetPassword = (newPassword: string, confirmPassword: string): string => {
  const passwordError = validatePassword(newPassword);
  if (passwordError) return passwordError;
  if (newPassword !== confirmPassword) return ERROR_MESSAGES.CONFIRM_PASSWORD_NOT_MATCH;
  return "";
};

export const validateAuthField = (name: AuthFieldName, value: string): string =>
  name === "email" ? validateEmail(value) : validatePassword(value);

// Existing credentials may predate the current registration policy.
export const validateLoginField = (name: AuthFieldName, value: string): string =>
  name === "email" ? validateEmail(value) : value ? "" : ERROR_MESSAGES.PASSWORD_REQUIRED;
