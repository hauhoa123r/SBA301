import { useState } from "react";
import HeroLogo from "./HeroLogo"; 
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "../services/navigation/navigation.mockup";
import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../app/provider/useAuth";
import UserProfileMenu from "./UserProfileMenu";
import MobileMenu from "./MobileMenu";

export default function HeroHeader() {
    const [openMobile, setOpenMobile] = useState(false);
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        setOpenMobile(false);
        navigate("/login");
    };

    return (
        <header className="sticky top-0 z-50 border-b border-brand-accent/10 bg-brand-dark/80 backdrop-blur-xl">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                <HeroLogo />
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
                            Bắt đầu học
                        </NavLink>
                        <UserProfileMenu />
                    </div>
                ) : (
                    <div className="hidden md:flex items-center gap-3 text-sm font-medium">
                        <NavLink to="/login" className="text-brand-textSecondary hover:text-brand-accent px-4 py-2 border border-brand-accent/30 rounded-full no-underline transition-colors">
                            Đăng nhập
                        </NavLink>
                        <NavLink to="/register" className="bg-brand-accent hover:bg-brand-accentHover text-brand-white px-6 py-2 rounded-full no-underline transition-colors shadow-md shadow-brand-accent/25">
                            Bắt đầu ngay
                        </NavLink>
                    </div>
                )}
                <button className="md:hidden text-brand-textSecondary hover:text-brand-white p-1" onClick={() => setOpenMobile(!openMobile)}>
                    {openMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>
            {openMobile && <MobileMenu user={user} onClose={() => setOpenMobile(false)} onLogout={handleLogout} />}
        </header>
    );
}
