import { Menu, X, Bell, Search } from 'lucide-react';

export default function TeacherHeader({ sidebarOpen, onSidebarToggle, displayName, avatarUrl, avatarInitial }) {
  return (
    <header className="sticky top-0 z-30 bg-brand-header border-b border-brand-borderSoft shadow-lg shadow-black/10">
      <div className="flex items-center justify-between px-4 md:px-8 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onSidebarToggle}
            className="md:hidden p-2 hover:bg-brand-sidebarHover text-brand-textPrimary rounded-lg transition-colors duration-200"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="hidden md:flex items-center gap-2 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-mutedText" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full md:w-80 pl-10 pr-4 py-2 border border-brand-borderSoft rounded-lg bg-brand-panel text-brand-textPrimary placeholder-brand-mutedText focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-colors duration-200"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-brand-textSecondary hover:bg-brand-sidebarHover hover:text-brand-textPrimary rounded-lg transition-colors duration-200">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-danger rounded-full ring-2 ring-brand-header" />
          </button>

          <div className="flex items-center gap-3 pl-4 border-l border-brand-borderSoft">
            <div className="hidden sm:flex flex-col text-right text-sm">
              <p className="font-medium text-brand-textPrimary">{displayName}</p>
              <p className="text-xs text-brand-mutedText">Teacher</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-accent text-brand-white font-bold text-sm ring-2 ring-brand-accentSoft/30">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-full w-full object-cover rounded-full"
                />
              ) : (
                avatarInitial
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
