import React from "react";
import { Navigate } from "react-router-dom";
import ManagerLayout from "../layouts/ManagerLayout";
import UserManager from "../pages/UserManager";
import RoleManager from "../pages/RoleManager";
import UserAccountControl from "../pages/UserAccountControl";

const managerRoutes = [
    {
        path: "/admin",
        element: <ManagerLayout />,
        children: [
            {
                index: true,
                element: <Navigate to="users" replace />,
            },
            {
                path: "users",
                element: <UserManager />,
            },
            {
                path: "accounts",
                element: <UserAccountControl />,
            },
            {
                path: "roles",
                element: <RoleManager />,
            },
        ],
    },
];

export default managerRoutes;