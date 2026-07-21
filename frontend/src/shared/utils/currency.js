const vndCurrencyFormatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
});

const toSafeNumber = (value) => {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : 0;
};

export const formatVndCurrency = (value) => {
    const amount = toSafeNumber(value);
    return vndCurrencyFormatter.format(amount);
};

export const formatCoursePrice = (value) => {
    const amount = toSafeNumber(value);
    if (amount <= 0) return "Miễn phí";
    return vndCurrencyFormatter.format(amount);
};
