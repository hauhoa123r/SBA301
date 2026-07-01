import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../../app/provider/AuthProvider';
import TeacherHeader from '../../../shared/components/TeacherHeader';
import TeacherSidebar from '../../../shared/components/TeacherSidebar';

export default function TeacherLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();

  const displayName = user?.fullName || user?.name || user?.username || 'Teacher';
  const avatarUrl = user?.avatar || user?.avatarUrl || user?.image;
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-brand-dark flex">
      <TeacherSidebar sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-h-screen">
        <TeacherHeader
          sidebarOpen={sidebarOpen}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          displayName={displayName}
          avatarUrl={avatarUrl}
          avatarInitial={avatarInitial}
        />

        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
