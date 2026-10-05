import { formatVndCurrency } from "@/shared/utils/currency";

export const formatNumber = (value: number) => new Intl.NumberFormat("vi-VN").format(value);
export const formatMoney = formatVndCurrency;
