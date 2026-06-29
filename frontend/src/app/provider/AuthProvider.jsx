import { useState } from "react";
import AuthContext from "./AuthContext";

export function AuthProvider({ children }) {

    const [user, setStoredUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        if (!savedUser) return null;

        try {
            return JSON.parse(savedUser);
        } catch {
            localStorage.removeItem("user");
            return null;
        }
    });

    const setUser = (nextUser) => {
        setStoredUser((currentUser) => {
            const resolvedUser = typeof nextUser === "function" ? nextUser(currentUser) : nextUser;

            if (resolvedUser) {
                localStorage.setItem("user", JSON.stringify(resolvedUser));
            } else {
                localStorage.removeItem("user");
            }

            return resolvedUser;
        });
    };

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}
