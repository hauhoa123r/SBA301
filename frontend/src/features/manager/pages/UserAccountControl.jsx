import { useState, useEffect, useCallback } from "react";
import { getUsers, changeUserStatus, deleteUser } from "../service/adminService";

import Toast from "../components/common/Toast";
import SearchFilter from "../components/common/SearchFilter";
import Pagination from "../components/common/Pagination";
import UserTable from "../components/user/UserTable";
import Loading from "../components/common/Loading";
import ConfirmModal from "../components/common/ConfirmModal";

export default function UserAccountControl() {
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [confirmModal, setConfirmModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers({
        keyword,
        status: filterStatus,
        page,
        size: 8,
        sortBy: "id",
        sortDir: "asc",
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

  const handleConfirm = async () => {
    try {
      if (confirmModal.type === "delete") {
        await deleteUser(confirmModal.user.id);
        showToast("Xóa thành công");
      } else {
        const status = confirmModal.user.status === "ACTIVE" ? "LOCKED" : "ACTIVE";
        await changeUserStatus(confirmModal.user.id, status);
        showToast("Cập nhật trạng thái thành công");
      }
      setConfirmModal(null);
      fetchUsers();
    } catch (error) {
      const responseData = error?.response?.data;
      const validationMessage = responseData?.data && typeof responseData.data === "object"
        ? Object.values(responseData.data)[0]
        : null;
      const message = validationMessage || responseData?.message || "Không thể thực hiện thao tác";
      showToast(message, "error");
      setConfirmModal(null);
    }
  };
  return (
    <div className="p-6 text-white">
      <Toast toast={toast} />
      <h1 className="text-2xl font-bold mb-5">Kiểm soát tài khoản người dùng</h1>
      <SearchFilter
        keyword={keyword}
        setKeyword={setKeyword}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}/>
      <div className="bg-gray-900 rounded-xl overflow-hidden">
        {loading ? (
          <Loading />
        ) : (
          <UserTable
            users={users}
            onLock={(user) => setConfirmModal({ type: "status", user })}
            onDelete={(user) => setConfirmModal({ type: "delete", user })}/>)
            }
      </div>
      <Pagination 
        page={page} 
        totalPages={totalPages} 
        setPage={setPage} />
      {confirmModal && (<ConfirmModal 
          title="Xác nhận" 
          onClose={() => setConfirmModal(null)} 
          onConfirm={handleConfirm} 
          confirmText={confirmModal.type === "delete" ? "Xóa" : (confirmModal.user.status === "ACTIVE" ? "Khóa" : "Mở khóa")}>
          {confirmModal.type === "delete"
            ? `Bạn có chắc muốn xóa tài khoản ${confirmModal.user.fullName}?`
            : confirmModal.user.status === "ACTIVE"
              ? `Bạn có chắc muốn khóa tài khoản ${confirmModal.user.fullName}?`
              : `Bạn có chắc muốn mở khóa tài khoản ${confirmModal.user.fullName}?`}
        </ConfirmModal>
      )}
    </div>
  );
}
