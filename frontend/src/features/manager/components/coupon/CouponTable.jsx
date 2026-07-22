const formatDiscountType = (type) =>
    ({ PERCENTAGE: "Phần trăm", FIXED_AMOUNT: "Số tiền cố định" }[type] || type || "--");

const formatDateTime = (val) =>
    !val ? "--" : isNaN(new Date(val)) ? val : new Date(val).toLocaleDateString("vi-VN");

const formatDiscountValue = (type, val) => {
    if (val === null || val === undefined || val === "") {
        return "--";
    }

    return type === "PERCENTAGE"
        ? `${val}%`
        : Number(val).toLocaleString("vi-VN");
};

export default function CouponTable({ coupons = [], onEdit, onDelete }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[920px]">
                <thead>
                    <tr className="border-b border-gray-800 text-left text-sm text-gray-400">
                        <th className="pb-3 pr-4">Code</th>
                        <th className="pb-3 pr-4">Loại giảm giá</th>
                        <th className="pb-3 pr-4">Giá trị giảm</th>
                        <th className="pb-3 pr-4">Số lượt tối đa</th>
                        <th className="pb-3 pr-4">Hiệu lực từ</th>
                        <th className="pb-3 pr-4">Hiệu lực đến</th>
                        <th className="pb-3 text-right">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {!coupons.length ? (
                        <tr>
                            <td colSpan="7" className="py-8 text-center text-gray-400">
                                Không có mã giảm giá phù hợp.
                            </td>
                        </tr>
                    ) : (
                        coupons.map((c) => (
                            <tr key={c.id} className="border-b border-gray-800 last:border-b-0">
                                <td className="py-4 pr-4 font-semibold text-white">{c.code}</td>
                                <td className="py-4 pr-4 text-gray-300">{formatDiscountType(c.discountType)}</td>
                                <td className="py-4 pr-4 text-gray-300">{formatDiscountValue(c.discountType, c.discountValue)}</td>
                                <td className="py-4 pr-4 text-gray-300">{c.maxUses ?? "--"}</td>
                                <td className="py-4 pr-4 text-gray-300">{formatDateTime(c.validFrom)}</td>
                                <td className="py-4 pr-4 text-gray-300">{formatDateTime(c.validUntil)}</td>
                                <td className="py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => onEdit(c)} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500">
                                            Sửa
                                        </button>
                                        <button onClick={() => onDelete(c)} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500">
                                            Xóa
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
