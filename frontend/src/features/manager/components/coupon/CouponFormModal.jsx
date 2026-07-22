const toInputDate = (val) =>
    val && !isNaN(new Date(val)) ? new Date(val).toISOString().slice(0, 10) : "";

export default function CouponFormModal({ open, mode, form, onChange, onClose, onSubmit, loading }) {
    if (!open) return null;

    const isCreate = mode === "create";
    const inputCls = "w-full rounded-xl bg-gray-800 px-4 py-3 outline-none focus:ring-1 focus:ring-blue-500";
    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-2xl rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            {isCreate ? "Thêm mã giảm giá" : "Sửa mã giảm giá"}
                        </h2>
                        <p className="mt-1 text-sm text-gray-400">
                            Chỉ quản lý các thông tin cơ bản của coupon cho admin.
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">Đóng</button>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-gray-300">Code</label>
                        <input
                            value={form.code || ""}
                            onChange={(e) => onChange("code", e.target.value)}
                            className={inputCls}
                            placeholder="Nhập mã giảm giá"/>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-300">Loại giảm giá</label>
                        <select
                            value={form.discountType}
                            onChange={(e) => onChange("discountType", e.target.value)}
                            className={`${inputCls} cursor-pointer`}>
                            <option value="PERCENTAGE">Phần trăm</option>
                            <option value="FIXED_AMOUNT">Số tiền cố định</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-300">Giá trị giảm</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.discountValue ?? ""}
                            onChange={(e) => onChange("discountValue", e.target.value)}
                            className={inputCls}
                            placeholder="Nhập giá trị giảm"/>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-300">Số lượt tối đa</label>
                        <input
                            type="number"
                            min="1"
                            step="1"
                            value={form.maxUses ?? ""}
                            onChange={(e) => onChange("maxUses", e.target.value)}
                            className={inputCls}
                            placeholder="Nhập số lượt tối đa"/>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-300">Hiệu lực từ</label>
                        <input
                            type="date"
                            value={toInputDate(form.validFrom)}
                            onChange={(e) => onChange("validFrom", e.target.value)}
                            className={inputCls} />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-300">Hiệu lực đến</label>
                        <input
                            type="date"
                            value={toInputDate(form.validUntil)}
                            onChange={(e) => onChange("validUntil", e.target.value)}
                            className={inputCls}/>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="rounded-xl bg-gray-800 px-4 py-3 font-semibold text-gray-200 hover:bg-gray-700">
                        Hủy
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={loading}
                        className="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60">
                        {loading ? "Đang lưu..." : isCreate ? "Thêm mới" : "Cập nhật"}
                    </button>
                </div>
            </div>
        </div>
    );
}
