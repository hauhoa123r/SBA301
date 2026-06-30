import { useState } from "react";
import Logo from "./Logo"; 
import { LogOut, Menu, Settings, X } from "lucide-react";
import { NAV_LINKS } from "../services/navigation/navigation.mockup";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../app/provider/AuthProvider";
import UserProfileMenu from "./UserProfileMenu";

export default function HeroHeader() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    const displayName = user?.fullName || user?.name || user?.username || "User";
    const email = user?.email;
    const avatarUrl = user?.avatar || user?.avatarUrl || user?.image;
    const avatarInitial = displayName.charAt(0).toUpperCase();

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        setMobileOpen(false);
        navigate("/login");
    };

    return (
        <header className="sticky top-0 z-50 border-b border-brand-accent/10 bg-brand-dark/80 backdrop-blur-xl">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                <Logo />
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                    {NAV_LINKS.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                isActive
                                    ? "text-brand-white no-underline"
                                    : "text-brand-textSecondary hover:text-brand-accent no-underline transition-colors"
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
                {user ? (
                    <div className="hidden md:flex items-center gap-3">
                        <NavLink to="/learning" className="bg-brand-accent hover:bg-brand-accentHover text-brand-white px-6 py-2 rounded-full text-sm font-medium no-underline transition-colors shadow-md shadow-brand-accent/25">
                            Start Learning
                        </NavLink>
                        <UserProfileMenu />
                    </div>
                ) : (
                    <div className="hidden md:flex items-center gap-3 text-sm font-medium">
                        <NavLink to="/login" className="text-brand-textSecondary hover:text-brand-accent px-4 py-2 border border-brand-accent/30 rounded-full no-underline transition-colors">
                            Login
                        </NavLink>
                        <NavLink to="/register" className="bg-brand-accent hover:bg-brand-accentHover text-brand-white px-6 py-2 rounded-full no-underline transition-colors shadow-md shadow-brand-accent/25">
                            Get Started
                        </NavLink>
                    </div>
                )}
                <button className="md:hidden text-brand-textSecondary hover:text-brand-white p-1" onClick={() => setMobileOpen(!mobileOpen)}>
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>
            {mobileOpen && (
                <div className="md:hidden bg-brand-dark border-t border-brand-accent/10 px-6 py-4 flex flex-col gap-4">
                    {NAV_LINKS.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileOpen(false)}
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
                            <NavLink to="/user/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm text-brand-textSecondary no-underline">
                                <Settings className="h-4 w-4" />
                                Cài đặt
                            </NavLink>
                            <NavLink to="/learning" onClick={() => setMobileOpen(false)} className="w-fit rounded-full bg-brand-accent px-4 py-2 text-sm font-medium text-brand-white no-underline">
                                Start Learning
                            </NavLink>
                            <button type="button" onClick={handleLogout} className="flex items-center gap-2 text-left text-sm text-brand-textSecondary">
                                <LogOut className="h-4 w-4" />
                                Đăng xuất
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-3 pt-2">
                            <NavLink to="/login" onClick={() => setMobileOpen(false)} className="text-sm text-brand-textSecondary border border-brand-accent/30 px-4 py-2 rounded-full no-underline">
                                Login
                            </NavLink>
                            <NavLink to="/register" onClick={() => setMobileOpen(false)} className="text-sm text-brand-white bg-brand-accent px-4 py-2 rounded-full no-underline">
                                Get Started
                            </NavLink>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}
