import React from "react";
import HeroHeader from "../../../shared/components/HeroHeader";
import HeroFooter from "../../../shared/components/HeroFooter";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  {
    path: "/admin/users",
    label: "User Management",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    path: "/admin/accounts",
    label: "User Account Control",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    path: "/admin/roles",
    label: "Role Management",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

export default function ManagerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentNav = NAV_ITEMS.find(i => i.path === location.pathname) || NAV_ITEMS[0];

  return (
    <div className="flex flex-col min-h-screen bg-brand-dark font-sans text-brand-textPrimary">
      <HeroHeader />

      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-7xl mx-auto bg-brand-cardBg rounded-3xl shadow-2xl border border-brand-light overflow-hidden flex flex-col md:flex-row min-h-[80vh]">

          {/* Sidebar */}
          <aside className="w-full md:w-64 bg-brand-dark/50 flex flex-col border-r border-brand-light flex-shrink-0">
            <div className="p-6 text-xl font-bold text-brand-accent flex items-center gap-3 border-b border-brand-light">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-accent to-purple-900 flex items-center justify-center text-white flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              Admin Panel
            </div>

            <nav className="flex-1 py-4 flex flex-col gap-1 px-3">
              {NAV_ITEMS.map(item => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`w-full px-4 py-3 flex items-center gap-3 text-sm font-medium rounded-xl transition-all text-left no-underline
                                ${isActive
                        ? "bg-brand-accent/20 text-brand-accent border border-brand-accent/30"
                        : "text-brand-textSecondary hover:bg-brand-light/50 hover:text-white border border-transparent"}`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-brand-light">
              <button
                onClick={() => navigate("/")}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-brand-textSecondary hover:bg-brand-light/50 hover:text-white transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                Quay về trang chủ
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <header className="h-16 border-b border-brand-light flex items-center justify-between px-6 bg-brand-cardBg/50 flex-shrink-0">
              <div className="text-sm font-semibold text-white">
                {currentNav.label}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 pl-4 border-l border-brand-light cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-brand-accent to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-lg">A</div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-semibold text-white leading-tight">Admin</p>
                    <p className="text-xs text-brand-textSecondary leading-tight">System</p>
                  </div>
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-hidden flex flex-col relative">
              <Outlet />
            </div>
          </div>
        </div>
      </main>

      <HeroFooter />
    </div>
  );
}
