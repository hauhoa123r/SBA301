import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, BookOpen, Star, Settings, LogOut, FileQuestion } from 'lucide-react';
import useAuth from '../../app/provider/useAuth';

export default function TeacherSidebar({ sidebarOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    navigate('/login', { replace: true });
  };

  const sidebarItems = [
    {
      path: '/management/dashboard',
      label: 'Dashboard',
      icon: BarChart3,
    },
    {
      path: '/management/courses',
      label: 'My Courses',
      icon: BookOpen,
    },
    {
      path: '/management/quizzes',
      label: 'Quiz Bank',
      icon: FileQuestion,
    },
  ];

  const isActive = (path) => location.pathname === path;

  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      <div
        className={`fixed md:relative z-50 md:z-0 top-0 left-0 h-screen w-64 bg-brand-sidebar border-r border-brand-borderSoft transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Header */}
          <div className="p-5 border-b border-brand-borderSoft">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo-removebg-preview.png"
                alt="Edujar Logo"
                className="h-9 w-auto object-contain"
              />
              <span
                className="text-xl font-bold text-brand-accent tracking-wide"
                style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}
              >
                Edujar
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-brand-sidebarActive text-brand-textPrimary shadow-lg shadow-brand-sidebarActive/30'
                      : 'text-brand-textSecondary hover:bg-brand-sidebarHover hover:text-brand-textPrimary'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-brand-borderSoft space-y-1.5">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-brand-textSecondary hover:bg-brand-sidebarHover hover:text-brand-textPrimary rounded-lg transition-colors duration-200">
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-brand-danger hover:bg-brand-danger/10 rounded-lg transition-colors duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-black/60 backdrop-blur-sm" onClick={onClose} />
      )}
    </>
  );
}
