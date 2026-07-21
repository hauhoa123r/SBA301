const FALLBACK_PAYMENT_ERROR_MESSAGE = "Không thể tạo thanh toán. Vui lòng thử lại.";

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

const isFriendlyMessage = (message) => {
    if (typeof message !== "string") return false;
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return false;
    return !TECHNICAL_ERROR_PATTERNS.some((pattern) => pattern.test(trimmedMessage));
};

export const getPaymentErrorMessage = (err) => {
    const data = err?.response?.data;
    const candidates = [
        data?.message,
        data?.error && data?.path ? `${data.error}: ${data.path}` : data?.error,
        err?.message,
    ];

    return candidates.find(isFriendlyMessage) || FALLBACK_PAYMENT_ERROR_MESSAGE;
};
