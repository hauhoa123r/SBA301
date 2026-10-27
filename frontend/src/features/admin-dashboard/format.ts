export const formatNumber = (value: number) => new Intl.NumberFormat("vi-VN").format(value);
const adminCurrency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0, maximumFractionDigits: 2 });
export const formatMoney = (value: number) => adminCurrency.format(value);
