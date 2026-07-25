import { getApiErrorMessage } from "@/shared/api";

const FALLBACK_PAYMENT_ERROR_MESSAGE =
  "Không thể tạo thanh toán. Vui lòng thử lại.";

const TECHNICAL_ERROR_PATTERNS = [
  /\bexception\b/i,
  /\bstack\b/i,
  /\btrace\b/i,
  /\bsql\b/i,
  /\bsyntax\b/i,
  /\bnull\b/i,
  /\bundefined\b/i,
  /\bjava\./i,
  /\borg\./i,
  /\baxios\b/i,
];

function isFriendlyMessage(message: string): boolean {
  const trimmedMessage = message.trim();
  if (!trimmedMessage) return false;
  return !TECHNICAL_ERROR_PATTERNS.some((pattern) => pattern.test(trimmedMessage));
}

export function getPaymentErrorMessage(error: unknown): string {
  const message = getApiErrorMessage(error, FALLBACK_PAYMENT_ERROR_MESSAGE);
  return isFriendlyMessage(message) ? message : FALLBACK_PAYMENT_ERROR_MESSAGE;
}

