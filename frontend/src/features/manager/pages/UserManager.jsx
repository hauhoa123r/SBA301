import { useState, useEffect, useCallback } from "react";
import { getUsers, updateUser, getRoles, updateUserRoles } from "../service/adminService";
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

  const fetchUsers = useCallback(async () => {
    const data = await getUsers({
      keyword,
      status: filterStatus,
      page,
      size: 8,
    });

    setUsers(data.content || []);
    setTotalPages(data.totalPages || 1);
  }, [keyword, filterStatus, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="p-6 text-white">
      <Toast toast={toast} />

      <h1 className="text-2xl font-bold mb-5">User Management</h1>

      <SearchFilter
        keyword={keyword}
        setKeyword={setKeyword}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      <div className="bg-gray-900 rounded-xl overflow-hidden">
        <table className="w-full">
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-700">
                <td className="p-4">{user.fullName}</td>
                <td>{user.email}</td>
                <td>
                  <StatusBadge status={user.status} />
                </td>
                <td>
                  <button className="text-blue-400">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        setPage={setPage}
      />
    </div>
  );
}