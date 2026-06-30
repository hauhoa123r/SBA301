import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, BookOpen, Star, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../app/provider/AuthProvider';

export default function TeacherSidebar({ sidebarOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login', { replace: true });
  };

  const sidebarItems = [
    {
      path: '/teacher/dashboard',
      label: 'Thống Kê',
      icon: BarChart3,
    },
    {
      path: '/teacher/courses',
      label: 'Khóa Học',
      icon: BookOpen,
    },
    {
      path: '/teacher/reviews',
      label: 'Đánh Giá',
      icon: Star,
    },
  ];

  const isActive = (path) => location.pathname === path;

  const handleNavClick = () => {
    onClose();
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      <div
        className={`fixed md:relative z-50 md:z-0 top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-teal-600">TeacherHub</h1>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-teal-50 hover:text-teal-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200">
              <Settings className="w-5 h-5" />
              <span className="font-medium">Cài Đặt</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Đăng Xuất</span>
            </button>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-black/50" onClick={onClose} />
      )}
    </>
  );
}
