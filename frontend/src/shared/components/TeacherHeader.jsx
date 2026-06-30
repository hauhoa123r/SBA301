import { Menu, X, Bell } from 'lucide-react';

export default function TeacherHeader({ sidebarOpen, onSidebarToggle, displayName, avatarUrl, avatarInitial }) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 md:px-8 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onSidebarToggle}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="hidden md:flex items-center gap-2 flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full md:w-80 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors duration-200"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="hidden sm:flex flex-col text-right text-sm">
              <p className="font-medium text-gray-900">{displayName}</p>
              <p className="text-xs text-gray-500">Giáo Viên</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-white font-bold text-sm">
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
