import { useState } from "react";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../app/provider/AuthProvider";

export default function UserProfileMenu({ variant = "pill" }) {
    const [open, setOpen] = useState(false);
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    const displayName = user?.fullName || user?.name || user?.username || "User";
    const email = user?.email;
    const avatarUrl = user?.avatar || user?.avatarUrl || user?.image;
    const avatarInitial = displayName.charAt(0).toUpperCase();
    const isIcon = variant === "icon";

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        setOpen(false);
        navigate("/login");
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className={
                    isIcon
                        ? "grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-[#7c3aed] text-sm font-bold text-white shadow-lg shadow-[#7c3aed]/25 transition hover:bg-[#6d28d9]"
                        : "flex items-center gap-2 rounded-full border border-[#7c3aed]/30 bg-[#160e2e] py-1 pl-1 pr-3 text-sm font-medium text-white transition-colors hover:border-[#7c3aed]/60"
                }
                aria-expanded={open}
                aria-label="User menu"
            >
                <Avatar avatarUrl={avatarUrl} displayName={displayName} avatarInitial={avatarInitial} size={isIcon ? "h-10 w-10" : "h-9 w-9"} />
                {!isIcon && <ChevronDown className={`h-4 w-4 text-[#94a3b8] transition-transform ${open ? "rotate-180" : ""}`} />}
            </button>

            {open && (
                <div className="absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-xl border border-[#7c3aed]/20 bg-[#0f0920] shadow-xl shadow-[#000]/30">
                    <div className="flex items-center gap-3 border-b border-[#7c3aed]/10 px-4 py-3">
                        <Avatar avatarUrl={avatarUrl} displayName={displayName} avatarInitial={avatarInitial} size="h-11 w-11" />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                            {email && <p className="mt-0.5 truncate text-xs text-[#94a3b8]">{email}</p>}
                        </div>
                    </div>
                    <Link
                        to="/user/profile"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-[#94a3b8] no-underline transition-colors hover:bg-[#7c3aed]/10 hover:text-white"
                    >
                        <Settings className="h-4 w-4" />
                        Cài đặt
                    </Link>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[#94a3b8] transition-colors hover:bg-[#7c3aed]/10 hover:text-white"
                    >
                        <LogOut className="h-4 w-4" />
                        Đăng xuất
                    </button>
                </div>
            )}
        </div>
    );
}

function Avatar({ avatarUrl, displayName, avatarInitial, size }) {
    return (
        <span className={`flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#7c3aed] text-sm font-bold text-white`}>
            {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
            ) : (
                avatarInitial
            )}
        </span>
    );
}
