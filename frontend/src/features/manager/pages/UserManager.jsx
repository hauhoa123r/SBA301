import { useState, useEffect, useCallback } from "react";
import { createUser, getRoles, getUserById, getUsers } from "../service/adminService";
import Toast from "../components/common/Toast";
import Loading from "../components/common/Loading";
import SearchFilter from "../components/common/SearchFilter";
import Pagination from "../components/common/Pagination";
import StatusBadge from "../components/common/StatusBadge";

const INITIAL_CREATE_FORM = {
  fullName: "",
  email: "",
  password: "",
  roleId: "",
};

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState(INITIAL_CREATE_FORM);
  const [createLoading, setCreateLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers({
        keyword,
        status: filterStatus,
        page,
        size: 8,
      });

      setUsers(data.content || []);
      setTotalPages(data.totalPages || 1);
    } finally {
      setLoading(false);
    }
  }, [keyword, filterStatus, page]);

  const fetchRoles = useCallback(async () => {
    try {
      const data = await getRoles();
      setRoles((data || []).filter((role) => ["MODERATOR", "TEACHER", "STUDENT"].includes(role.name)));
    } catch (error) {
      const message = error?.response?.data?.message || "Không thể tải danh sách vai trò";
      setToast({ message, type: "error" });
      setTimeout(() => setToast(null), 3000);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleViewUser = async (userId) => {
    setViewLoading(true);
    try {
      const data = await getUserById(userId);
      setSelectedUser(data);
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to load user details";
      setToast({ message, type: "error" });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setViewLoading(false);
    }
  };

  const handleCreateFormChange = (field, value) => {
    setCreateForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOpenCreateModal = () => {
    setCreateForm(INITIAL_CREATE_FORM);
    setShowCreateModal(true);
  };
  const handleCreateUser = async () => {
    if (!createForm.fullName || !createForm.email || !createForm.password || !createForm.roleId) {
      setToast({ message: "Vui lòng nhập đầy đủ thông tin người dùng", type: "error" });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    setCreateLoading(true);
    try {
      await createUser({
        fullName: createForm.fullName.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        roleId: Number(createForm.roleId),
      });
      setShowCreateModal(false);
      setCreateForm(INITIAL_CREATE_FORM);
      setToast({ message: "Thêm người dùng thành công", type: "success" });
      setTimeout(() => setToast(null), 3000);
      setPage(0);
      fetchUsers();
    } catch (error) {
      const message = error?.response?.data?.message || "Không thể thêm người dùng";
      setToast({ message, type: "error" });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="p-6 text-white">
      <Toast toast={toast} />

      <div className="mb-5 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
        <button
          onClick={handleOpenCreateModal}
          className="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-500"
        >
          Thêm người dùng
        </button>
      </div>

      <SearchFilter
        keyword={keyword}
        setKeyword={setKeyword}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      <div className="bg-gray-900 rounded-xl overflow-hidden">
        {loading ? (
          <Loading />
        ) : (
          <table className="w-full">
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-700">
                  <td className="p-4">{user.fullName}</td>
                  <td>
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="text-right p-4">
                    <button
                      onClick={() => handleViewUser(user.id)}
                      className="text-blue-400 font-medium"
                    >
                      Xem
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        setPage={setPage}
      />

      {selectedUser && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-gray-900 border border-gray-800 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Chi tiết người dùng</h2>
                <p className="text-sm text-gray-400 mt-1">Thông tin chỉ xem của tài khoản này.</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-white"
              >
                Đóng
              </button>
            </div>

            {viewLoading ? (
              <Loading />
            ) : (
              <div className="mt-5 space-y-4">
                <div className="rounded-xl bg-gray-800 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Họ và tên</p>
                  <p className="mt-1 font-medium text-white">{selectedUser.fullName}</p>
                </div>

                <div className="rounded-xl bg-gray-800 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Email</p>
                  <p className="mt-1 font-medium text-white">{selectedUser.email}</p>
                </div>

                <div className="rounded-xl bg-gray-800 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Điểm</p>
                  <p className="mt-1 font-medium text-white">{selectedUser.totalLearningPoints ?? 0} pts</p>
                </div>

                <div className="rounded-xl bg-gray-800 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Trạng thái</p>
                  <div className="mt-2">
                    <StatusBadge status={selectedUser.status} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Thêm người dùng</h2>
                <p className="mt-1 text-sm text-gray-400">Tạo nhanh tài khoản mới với trạng thái mặc định là hoạt động.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                Đóng
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Họ và tên</label>
                <input
                  value={createForm.fullName}
                  onChange={(event) => handleCreateFormChange("fullName", event.target.value)}
                  className="w-full rounded-xl bg-gray-800 px-4 py-3 outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Email</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(event) => handleCreateFormChange("email", event.target.value)}
                  className="w-full rounded-xl bg-gray-800 px-4 py-3 outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Nhập email"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Mật khẩu</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(event) => handleCreateFormChange("password", event.target.value)}
                  className="w-full rounded-xl bg-gray-800 px-4 py-3 outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Nhập mật khẩu"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Vai trò</label>
                <select
                  value={createForm.roleId}
                  onChange={(event) => handleCreateFormChange("roleId", event.target.value)}
                  className="w-full cursor-pointer rounded-xl bg-gray-800 px-4 py-3 outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Chọn vai trò</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name === "TEACHER"
                        ? "Giảng viên"
                        : role.name === "MODERATOR"
                          ? "Điều phối viên"
                          : role.name === "STUDENT"
                            ? "Học viên"
                            : role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-xl bg-gray-800 px-4 py-3 font-semibold text-gray-200 transition-colors hover:bg-gray-700"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateUser}
                disabled={createLoading}
                className="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {createLoading ? "Đang thêm..." : "Thêm mới"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
