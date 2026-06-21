import { useState } from "react";
import Logo from "./Logo"; 
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "../../features/course/services/mockup";
import { NavLink } from "react-router-dom";

export default function HeroHeader() {
    const [mobileOpen, setMobileOpen] = useState(false);
    return (
        <header className="sticky top-0 z-50 border-b border-[#7c3aed]/10 bg-[#090514]/80 backdrop-blur-xl">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                <Logo />
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                    {NAV_LINKS.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                isActive
                                    ? "text-white no-underline"
                                    : "text-[#94a3b8] hover:text-[#7c3aed] no-underline transition-colors"
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="hidden md:flex items-center gap-3 text-sm font-medium">
                    <a href="/login" className="text-[#94a3b8] hover:text-[#7c3aed] px-4 py-2 border border-[#7c3aed]/30 rounded-full no-underline transition-colors">
                        Login
                    </a>
                    <a href="/signup" className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-6 py-2 rounded-full no-underline transition-colors shadow-md shadow-[#7c3aed]/25">
                        Get Started
                    </a>
                </div>
                <button className="md:hidden text-[#94a3b8] hover:text-white p-1" onClick={() => setMobileOpen(!mobileOpen)}>
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>
            {mobileOpen && (
                <div className="md:hidden bg-[#090514] border-t border-[#7c3aed]/10 px-6 py-4 flex flex-col gap-4">
                    {NAV_LINKS.map((link) => (
                        <a key={link} href="#" className="text-[#94a3b8] hover:text-[#7c3aed] text-sm no-underline">{link}</a>
                    ))}
                    <div className="flex gap-3 pt-2">
                        <a href="#" className="text-sm text-[#94a3b8] border border-[#7c3aed]/30 px-4 py-2 rounded-full no-underline">Login</a>
                        <a href="#" className="text-sm text-white bg-[#7c3aed] px-4 py-2 rounded-full no-underline">Get Started</a>
                    </div>
                </div>
            )}
        </header>
    );
}