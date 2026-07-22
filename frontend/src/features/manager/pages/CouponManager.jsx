import { useCallback, useEffect, useState } from "react";
import Loading from "../components/common/Loading";
import Pagination from "../components/common/Pagination";
import Toast from "../components/common/Toast";
import CouponFormModal from "../components/coupon/CouponFormModal";
import CouponTable from "../components/coupon/CouponTable";
import {
    createCoupon,
    deleteCoupon,
    getCouponById,
    getCoupons,
    updateCoupon,
} from "../service/adminService";
const INITIAL_FORM = {
    code: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    maxUses: "",
    validFrom: "",
    validUntil: "",
};
function getDefaultCouponDates() {
    const now = new Date();
    const dateOnly = now.toISOString().slice(0, 10);
    return {
        validFrom: dateOnly,
        validUntil: dateOnly,
    };
}

function toBoundaryIsoOrNull(value, boundary) {
    if (!value) return null;
    const timePart = boundary === "start" ? "T00:00:00" : "T23:59:00";
    const date = new Date(`${value}${timePart}`);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
export default function CouponManager() {
    const [coupons, setCoupons] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create");
    const [form, setForm] = useState(INITIAL_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [editingCouponId, setEditingCouponId] = useState(null);
    const showToast = useCallback((message, type = "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);
    const fetchCoupons = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getCoupons({
                keyword,
                page,
                size: 10,
                sortBy: "createdAt",
                sortDir: "desc",
            });
            setCoupons(data.content || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            const message = error?.response?.data?.message || "Không thể tải danh sách mã giảm giá";
            showToast(message);
        } finally {
            setLoading(false);
        }
    }, [keyword, page, showToast]);
    useEffect(() => {
        fetchCoupons();
    }, [fetchCoupons]);
    const resetForm = () => {
        setForm({
            ...INITIAL_FORM,
            ...getDefaultCouponDates(),
        });
        setEditingCouponId(null);
    };
    const handleChangeForm = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };
    const handleOpenCreate = () => {
        resetForm();
        setModalMode("create");
        setModalOpen(true);
    };
    const handleEdit = async (coupon) => {
        try {
            const data = await getCouponById(coupon.id);
            setEditingCouponId(data.id);
            setForm({
                code: data.code || "",
                discountType: data.discountType || "PERCENTAGE",
                discountValue: data.discountValue ?? "",
                maxUses: data.maxUses ?? "",
                validFrom: data.validFrom ? new Date(data.validFrom).toISOString().slice(0, 10) : "",
                validUntil: data.validUntil ? new Date(data.validUntil).toISOString().slice(0, 10) : "",
            });
            setModalMode("edit");
            setModalOpen(true);
        } catch (error) {
            const message = error?.response?.data?.message || "Không thể tải chi tiết mã giảm giá";
            showToast(message);
        }
    };
    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const payload = {
                code: form.code.trim(),
                discountType: form.discountType,
                discountValue: Number(form.discountValue),
                maxUses: form.maxUses === "" ? null : Number(form.maxUses),
                validFrom: toBoundaryIsoOrNull(form.validFrom, "start"),
                validUntil: toBoundaryIsoOrNull(form.validUntil, "end"),
            };

            if (modalMode === "create") {
                await createCoupon(payload);
                showToast("Thêm mã giảm giá thành công", "success");
            } else {
                await updateCoupon(editingCouponId, payload);
                showToast("Cập nhật mã giảm giá thành công", "success");
            }

            setModalOpen(false);
            resetForm();
            fetchCoupons();
        } catch (error) {
            const message = error?.response?.data?.message || "Không thể lưu mã giảm giá";
            showToast(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (coupon) => {
        const confirmed = window.confirm(`Bạn có chắc muốn xóa mã giảm giá ${coupon.code}?`);
        if (!confirmed) return;

        try {
            await deleteCoupon(coupon.id);
            showToast("Xóa mã giảm giá thành công", "success");
            fetchCoupons();
        } catch (error) {
            const message = error?.response?.data?.message || "Không thể xóa mã giảm giá";
            showToast(message);
        }
    };

    return (
        <div className="p-6 text-white">
            <Toast toast={toast} />

            <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý mã giảm giá</h1>
                    <p className="mt-1 text-sm text-gray-400">
                        Thêm, sửa và xóa các mã giảm giá cơ bản cho chiến dịch marketing.
                    </p>
                </div>

                <button
                    onClick={handleOpenCreate}
                    className="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-500"
                >
                    Thêm mã giảm giá
                </button>
            </div>

            <div className="mb-6 flex gap-3">
                <input
                    value={keyword}
                    onChange={(event) => {
                        setKeyword(event.target.value);
                        setPage(0);
                    }}
                    placeholder="Tìm theo code..."
                    className="flex-1 rounded-xl bg-gray-800 px-4 py-3 outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>

            <div className="rounded-xl bg-gray-900 p-5">
                {loading ? (
                    <Loading />
                ) : (
                    <>
                        <CouponTable coupons={coupons} onEdit={handleEdit} onDelete={handleDelete} />
                        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
                    </>
                )}
            </div>

            <CouponFormModal
                open={modalOpen}
                mode={modalMode}
                form={form}
                onChange={handleChangeForm}
                onClose={() => {
                    setModalOpen(false);
                    resetForm();
                }}
                onSubmit={handleSubmit}
                loading={submitting}
            />
        </div>
    );
}
