const vndCurrencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

const toSafeNumber = (value: unknown): number => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

export const formatVndCurrency = (value: unknown): string =>
  vndCurrencyFormatter.format(toSafeNumber(value));

export const formatCoursePrice = (value: unknown): string => {
  const amount = toSafeNumber(value);
  if (amount <= 0) return "Miễn phí";
  return vndCurrencyFormatter.format(amount);
};
