import axios from "axios";

export const DEFAULT_API_ERROR_MESSAGE = "Có lỗi xảy ra, vui lòng thử lại sau.";

export interface ApiErrorResponse {
  status?: number;
  message: string;
  error?: string;
  path?: string;
  timestamp?: string;
}

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getNonEmptyString = (value: unknown): string | undefined =>
  typeof value === "string" && value.length > 0 ? value : undefined;

const getNumericStatus = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const getResponseRecord = (error: unknown): UnknownRecord | undefined => {
  if (!isRecord(error)) return undefined;
  return isRecord(error.response) ? error.response : undefined;
};

const getResponseData = (error: unknown): unknown => {
  if (axios.isAxiosError<unknown, unknown>(error)) {
    return error.response?.data;
  }

  return getResponseRecord(error)?.data;
};

const getFirstValidationMessage = (value: unknown): string | undefined => {
  if (!isRecord(value)) return undefined;

  for (const detail of Object.values(value)) {
    const directMessage = getNonEmptyString(detail);
    if (directMessage) return directMessage;

    if (Array.isArray(detail)) {
      const arrayMessage = detail.find(
        (item): item is string => typeof item === "string" && item.length > 0,
      );
      if (arrayMessage) return arrayMessage;
    }

    if (isRecord(detail)) {
      const nestedMessage = getNonEmptyString(detail.message);
      if (nestedMessage) return nestedMessage;
    }
  }

  return undefined;
};

export const getApiErrorStatus = (error: unknown): number | undefined => {
  if (axios.isAxiosError<unknown, unknown>(error)) {
    return error.response?.status ?? getNumericStatus(error.status);
  }

  const responseStatus = getNumericStatus(getResponseRecord(error)?.status);
  if (responseStatus !== undefined) return responseStatus;

  return isRecord(error) ? getNumericStatus(error.status) : undefined;
};

export const normalizeApiError = (
  error: unknown,
  fallbackMessage = DEFAULT_API_ERROR_MESSAGE,
): ApiErrorResponse => {
  const responseData = getResponseData(error);
  const payload = isRecord(responseData) ? responseData : undefined;
  const responseMessage = getNonEmptyString(responseData);
  const validationMessage = getFirstValidationMessage(payload?.data);
  const payloadMessage = getNonEmptyString(payload?.message);
  const nativeMessage = error instanceof Error ? getNonEmptyString(error.message) : undefined;
  const status = getApiErrorStatus(error) ?? getNumericStatus(payload?.status);
  const message = validationMessage
    ?? responseMessage
    ?? payloadMessage
    ?? nativeMessage
    ?? fallbackMessage;

  return {
    ...(status === undefined ? {} : { status }),
    message,
    ...(getNonEmptyString(payload?.error) === undefined
      ? {}
      : { error: getNonEmptyString(payload?.error) }),
    ...(getNonEmptyString(payload?.path) === undefined
      ? {}
      : { path: getNonEmptyString(payload?.path) }),
    ...(getNonEmptyString(payload?.timestamp) === undefined
      ? {}
      : { timestamp: getNonEmptyString(payload?.timestamp) }),
  };
};

export const getApiErrorMessage = (
  error: unknown,
  fallbackMessage = DEFAULT_API_ERROR_MESSAGE,
): string => normalizeApiError(error, fallbackMessage).message;
