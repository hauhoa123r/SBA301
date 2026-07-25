import { LogOut, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import type { User } from "@/entities/user";
import { NAV_LINKS } from "../model/navigation";

interface MobileMenuProps {
    user: User | null;
    onClose: () => void;
    onLogout: () => void | Promise<void>;
}

export default function MobileMenu({ user, onClose, onLogout }: MobileMenuProps) {
    const displayName = user?.fullName || user?.name || user?.username || "Người dùng";
    const email = user?.email;
    const avatarUrl = user?.avatar || user?.avatarUrl || user?.image;
    const avatarInitial = displayName.charAt(0).toUpperCase();

    return (
        <div className="md:hidden bg-brand-dark border-t border-brand-accent/10 px-6 py-4 flex flex-col gap-4">
            {NAV_LINKS.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                        isActive
                            ? "text-brand-white text-sm no-underline"
                            : "text-brand-textSecondary hover:text-brand-accent text-sm no-underline transition-colors"
                    }
                >
                    {item.label}
                </NavLink>
            ))}

            {user ? (
                <div className="flex flex-col gap-3 border-t border-brand-accent/10 pt-4">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-accent text-sm font-bold text-brand-white">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                            ) : (
                                avatarInitial
                            )}
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-brand-white">{displayName}</p>
                            {email && <p className="mt-0.5 truncate text-xs text-brand-textSecondary">{email}</p>}
                        </div>
                    </div>
                    <NavLink to="/user/profile" onClick={onClose} className="flex items-center gap-2 text-sm text-brand-textSecondary no-underline">
                        <Settings className="h-4 w-4" />
                        Cài đặt
                    </NavLink>
                    <NavLink to="/learning" onClick={onClose} className="w-fit rounded-full bg-brand-accent px-4 py-2 text-sm font-medium text-brand-white no-underline">
                        Bắt đầu học
                    </NavLink>
                    <button type="button" onClick={() => {
                        void onLogout();
                    }} className="flex items-center gap-2 text-left text-sm text-brand-textSecondary">
                        <LogOut className="h-4 w-4" />
                        Đăng xuất
                    </button>
                </div>
            ) : (
                <div className="flex gap-3 pt-2">
                    <NavLink to="/login" onClick={onClose} className="text-sm text-brand-textSecondary border border-brand-accent/30 px-4 py-2 rounded-full no-underline">
                        Đăng nhập
                    </NavLink>
                    <NavLink to="/register" onClick={onClose} className="text-sm text-brand-white bg-brand-accent px-4 py-2 rounded-full no-underline">
                        Bắt đầu ngay
                    </NavLink>
                </div>
            )}
        </div>
    );
}
