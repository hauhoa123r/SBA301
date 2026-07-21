import { useCallback, useEffect, useMemo, useState } from "react";
import { getRoles, getUsers, updateUserRoles } from "../service/adminService";

import Toast from "../components/common/Toast";
import Loading from "../components/common/Loading";
import Pagination from "../components/common/Pagination";

const VISIBLE_ROLE_NAMES = ["ADMIN", "MODERATOR", "TEACHER", "STUDENT"];
const EDITABLE_ROLE_NAMES = ["MODERATOR", "TEACHER", "STUDENT"];
const PERMISSION_SUMMARY_MAP = {
    ADMIN: "Quản trị viên toàn hệ thống, có toàn quyền quản lý nền tảng.",
    MODERATOR: "Kiểm duyệt nội dung, xử lý báo cáo và hỗ trợ quản lý hệ thống.",
    TEACHER: "Giảng viên tạo và quản lý khóa học, bài học và giảng dạy.",
    STUDENT: "Học viên tham gia khóa học và sử dụng các chức năng học tập.",
};

function summarizePermissions(roleName, roles) {
    const role = roles.find((item) => item.name === roleName);
    if (!role) {
        return "Không có mô tả quyền";
    }

    if (PERMISSION_SUMMARY_MAP[roleName]) {
        return PERMISSION_SUMMARY_MAP[roleName];
    }

    if (role.description) {
        return role.description;
    }

    const topPermissions = (role.permissions || [])
        .slice(0, 3)
        .map((permission) => permission.name || permission.code)
        .filter(Boolean);

    return topPermissions.length > 0 ? topPermissions.join(", ") : "Không có mô tả quyền";
}

export default function RoleManager() {
    const [roles, setRoles] = useState([]);
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [editModal, setEditModal] = useState(null);
    const [selectedRoleId, setSelectedRoleId] = useState("");
    const [saving, setSaving] = useState(false);

    const showToast = useCallback((message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [roleData, userData] = await Promise.all([
                getRoles(),
                getUsers({
                    page,
                    size: 10,
                    sortBy: "id",
                    sortDir: "asc",
                }),
            ]);

            setRoles(roleData || []);
            setUsers(userData.content || []);
            setTotalPages(userData.totalPages || 1);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const editableRoles = useMemo(
        () => roles.filter((role) => EDITABLE_ROLE_NAMES.includes(role.name)),
        [roles]
    );

    const roleAccounts = useMemo(
        () =>
            [...users]
                .filter((user) => {
                    const roleName = user.roles?.[0]?.name;
                    return VISIBLE_ROLE_NAMES.includes(roleName);
                })
                .sort((left, right) => Number(left.id) - Number(right.id)),
        [users]
    );

    const openEditModal = (user) => {
        const currentRoleName = user.roles?.[0]?.name || "";
        const initialRole = editableRoles.find((role) => role.name === currentRoleName);
        setSelectedRoleId(initialRole ? String(initialRole.id) : "");
        setEditModal(user);
    };

    const closeEditModal = () => {
        setEditModal(null);
        setSelectedRoleId("");
    };

    const handleSaveRole = async () => {
        if (!editModal) return;

        const currentRoleName = editModal.roles?.[0]?.name || "";
        if (currentRoleName === "ADMIN") {
            showToast("Tài khoản ADMIN không thể được gán sang vai trò khác", "error");
            return;
        }

        if (!selectedRoleId) {
            showToast("Vui lòng chọn vai trò hợp lệ", "error");
            return;
        }

        setSaving(true);
        try {
            await updateUserRoles(editModal.id, [Number(selectedRoleId)]);
            showToast("Cập nhật vai trò thành công");
            closeEditModal();
            fetchData();
        } catch (error) {
            const message = error?.response?.data?.message || "Cập nhật vai trò thất bại";
            showToast(message, "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 text-white">
            <Toast toast={toast} />

            <h1 className="text-2xl font-bold mb-5">Quản lý vai trò và quyền hạn</h1>

            {loading ? (
                <Loading />
            ) : (
                <section className="bg-gray-900 rounded-xl p-5">
                    <div className="flex items-start justify-between gap-4 mb-5">
                        <div>
                            <h2 className="text-xl font-bold">Tài khoản theo vai trò</h2>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px]">
                            <thead>
                                <tr className="text-left text-sm text-gray-400 border-b border-gray-800">
                                    <th className="pb-3 pr-4">Tên</th>
                                    <th className="pb-3 pr-4">Quyền hạn</th>
                                    <th className="pb-3 pr-4">Vai trò hiện tại</th>
                                    <th className="pb-3 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roleAccounts.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-8 text-center text-gray-400">
                                            Không tìm thấy tài khoản thuộc các vai trò cần quản lý.
                                        </td>
                                    </tr>
                                ) : (
                                    roleAccounts.map((user) => {
                                        const currentRole = user.roles?.[0]?.name || "N/A";
                                        const isAdmin = currentRole === "ADMIN";

                                        return (
                                            <tr key={user.id} className="border-b border-gray-800 last:border-b-0">
                                                <td className="py-4 pr-4 font-medium">{user.fullName}</td>
                                                <td className="py-4 pr-4 text-gray-300 max-w-[420px]">
                                                    <span className="line-clamp-2">
                                                        {summarizePermissions(currentRole, roles)}
                                                    </span>
                                                </td>
                                                <td className="py-4 pr-4">
                                                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300">
                                                        {currentRole}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-right">
                                                    <button
                                                        onClick={() => openEditModal(user)}
                                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isAdmin
                                                                ? "bg-gray-800 text-gray-400"
                                                                : "bg-blue-600 hover:bg-blue-500 text-white"
                                                            }`}
                                                    >
                                                        Sửa vai trò
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination page={page} totalPages={totalPages} setPage={setPage} />
                </section>
            )}

            {editModal && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-gray-900 border border-gray-800 p-6 shadow-2xl">
                        <h3 className="text-xl font-bold">Sửa vai trò</h3>
                        <p className="text-sm text-gray-400 mt-1">
                            Cập nhật vai trò hiện tại cho <span className="text-white font-medium">{editModal.fullName}</span>.
                        </p>

                        <div className="mt-5 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Tài khoản</label>
                                <div className="rounded-xl bg-gray-800 px-4 py-3 text-sm text-gray-200">
                                    #{editModal.id} · {editModal.email}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Vai trò</label>
                                {editModal.roles?.[0]?.name === "ADMIN" ? (
                                    <div className="rounded-xl bg-gray-800 px-4 py-3 text-sm text-gray-400">
                                        ADMIN được bảo vệ và không thể thay đổi.
                                    </div>
                                ) : (
                                    <select
                                        value={selectedRoleId}
                                        onChange={(event) => setSelectedRoleId(event.target.value)}
                                        className="w-full rounded-xl bg-gray-800 px-4 py-3 text-sm text-white outline-none border border-gray-700"
                                    >
                                        <option value="">Chọn vai trò</option>
                                        {editableRoles.map((role) => (
                                            <option key={role.id} value={role.id}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={closeEditModal}
                                disabled={saving}
                                className="px-4 py-2 rounded-lg bg-gray-800 text-gray-200 disabled:opacity-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSaveRole}
                                disabled={saving || editModal.roles?.[0]?.name === "ADMIN"}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50"
                            >
                                {saving ? "Đang lưu..." : "Lưu"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
