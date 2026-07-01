import { useState, useEffect, useCallback } from "react";
import { getRoles, createRole, updateRole, deleteRole, getPermissions } from "../service/adminService";

import Toast from "../components/common/Toast";
import RoleCard from "../components/role/RoleCard";
import PermissionSelector from "../components/role/PermissionSelector";

export default function RoleManager() {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [expanded, setExpanded] = useState(null);
    const [modal, setModal] = useState(null);
    const [toast, setToast] = useState(null);

    const [form, setForm] = useState({
        name: "",
        description: "",
        permissionIds: [],
    });

    const fetchData = useCallback(async () => {
        const [r, p] = await Promise.all([getRoles(), getPermissions()]);
        setRoles(r);
        setPermissions(p);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const toggle = (id) => {
        setForm((prev) => ({
            ...prev,
            permissionIds: prev.permissionIds.includes(id)
                ? prev.permissionIds.filter((x) => x !== id)
                : [...prev.permissionIds, id],
        }));
    };

    const save = async () => {
        if (modal === "create") {
            await createRole(form);
        } else {
            await updateRole(modal.id, form);
        }

        setToast({ message: "Saved" });
        setModal(null);
        fetchData();
    };

    return (
        <div className="p-6 text-white">
            <Toast toast={toast} />

            <h1 className="text-2xl font-bold mb-5">Role Management</h1>

            <div className="space-y-4">
                {roles.map((role) => (
                    <RoleCard
                        key={role.id}
                        role={role}
                        expanded={expanded === role.id}
                        setExpanded={() => setExpanded(expanded === role.id ? null : role.id)}
                        onEdit={() => {
                            setForm({
                                name: role.name,
                                description: role.description || "",
                                permissionIds: role.permissions.map((p) => p.id),
                            });
                            setModal(role);
                        }}
                        onDelete={async () => {
                            await deleteRole(role.id);
                            fetchData();
                        }}
                    />
                ))}
            </div>

            {modal && (
                <div className="mt-5 bg-gray-900 p-5 rounded-xl">
                    <input
                        className="bg-gray-800 p-3 rounded w-full mb-4"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Role name"
                    />

                    <PermissionSelector
                        permissions={permissions}
                        selected={form.permissionIds}
                        toggle={toggle}
                    />

                    <button onClick={save} className="mt-4 bg-purple-600 px-5 py-2 rounded">
                        Save
                    </button>
                </div>
            )}
        </div>
    );
}