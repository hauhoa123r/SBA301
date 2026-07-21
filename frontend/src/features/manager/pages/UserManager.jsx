import { useState, useEffect, useCallback } from "react";
import { getUsers, getUserById } from "../service/adminService";
import Toast from "../components/common/Toast";
import Loading from "../components/common/Loading";
import SearchFilter from "../components/common/SearchFilter";
import Pagination from "../components/common/Pagination";
import StatusBadge from "../components/common/StatusBadge";

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

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

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  return (
    <div className="p-6 text-white">
      <Toast toast={toast} />

      <h1 className="text-2xl font-bold mb-5">Quản lý người dùng</h1>

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
    </div>
  );
}
