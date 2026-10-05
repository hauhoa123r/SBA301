import type { Dispatch, SetStateAction } from "react";
import type { SupportedUser } from "@/entities/user";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface EmailRequest {
  email: string;
}

export interface TokenVerificationRequest extends EmailRequest {
  token: string;
}

export interface ResetPasswordRequest extends TokenVerificationRequest {
  new_password: string;
  confirm_password: string;
}

export interface AuthMessageResponse {
  message?: string;
}

export interface AuthSession {
  user: SupportedUser;
  accessToken?: string;
  refreshToken?: string;
}

export interface OAuthSession {
  user: SupportedUser;
  accessToken: string;
  refreshToken: string;
}

export interface AuthContextValue {
  user: SupportedUser | null;
  setUser: Dispatch<SetStateAction<SupportedUser | null>>;
}

export interface AuthRedirectLocation {
  search: string;
  state?: unknown;
}
