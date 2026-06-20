import { useState } from "react";
import HeroHeader from "../../../shared/components/HeroHeader";
import HeroFooter from "../../../shared/components/HeroFooter";
import { useNavigate } from "react-router-dom";
export default function ViewProfilePage() {
  const navigate = useNavigate();
  const [user] = useState({
    fullName: "Nguyễn Văn A",
    username: "nguyenvana123",
    email: "nguyenvana@example.com",
    phone: "0987654321",
    address: "Hà Nội, Việt Nam",
    joinDate: "Tháng 5, 2023",
    status: "active",
  });
  const handleNavigateBack = () => {
    navigate("/");
  };

  const renderMainContent = () => {
    return (
      <div className="w-full max-w-3xl bg-brand-cardBg rounded-3xl shadow-2xl border border-brand-light overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-brand-accent to-purple-900 relative"></div>

        <div className="px-8 pb-8 relative">
          <div className="absolute -top-16 left-8">
            <div className="w-32 h-32 rounded-full border-4 border-brand-cardBg bg-brand-light flex items-center justify-center text-4xl font-bold text-brand-accent shadow-lg">
              {user.fullName.charAt(0)}
            </div>
          </div>

          <div className="flex justify-end pt-4 mb-8">
            <button className="bg-brand-light hover:bg-brand-accent/20 border border-brand-accent/30 text-brand-accent px-6 py-2 rounded-full text-sm font-medium transition-colors">
              Edit Profile
            </button>
          </div>

          <div className="mb-8 mt-2">
            <h2 className="text-3xl font-bold text-white tracking-wide">
              {user.fullName}
            </h2>
            <p className="text-brand-textSecondary mt-1">{user.username}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-brand-light/50 rounded-2xl p-5 border border-brand-light hover:border-brand-accent/30 transition-colors">
              <span className="text-xs font-semibold text-brand-textSecondary uppercase tracking-wider block mb-1">
                Email
              </span>
              <span className="text-base text-white">{user.email}</span>
            </div>
            <div className="bg-brand-light/50 rounded-2xl p-5 border border-brand-light hover:border-brand-accent/30 transition-colors">
              <span className="text-xs font-semibold text-brand-textSecondary uppercase tracking-wider block mb-1">
                Số điện thoại
              </span>
              <span className="text-base text-white">{user.phone}</span>
            </div>
            <div className="bg-brand-light/50 rounded-2xl p-5 border border-brand-light hover:border-brand-accent/30 transition-colors">
              <span className="text-xs font-semibold text-brand-textSecondary uppercase tracking-wider block mb-1">
                Địa chỉ
              </span>
              <span className="text-base text-white">{user.address}</span>
            </div>
            <div className="bg-brand-light/50 rounded-2xl p-5 border border-brand-light hover:border-brand-accent/30 transition-colors">
              <span className="text-xs font-semibold text-brand-textSecondary uppercase tracking-wider block mb-1">
                Ngày tham gia
              </span>
              <span className="text-base text-white">{user.joinDate}</span>
            </div>
          </div>

          <div className="mt-10">
            <button onClick={handleNavigateBack} className="w-full md:w-auto bg-brand-accent hover:bg-brand-accentHover text-white px-8 py-3 rounded-full font-semibold transition-all shadow-lg shadow-brand-accent/25 hover:shadow-brand-accentHover/40 active:scale-95">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-dark font-sans text-brand-textPrimary">
      <HeroHeader />

      <main className="flex-grow flex items-center justify-center p-6">
        {renderMainContent()}
      </main>

      <HeroFooter />
    </div>
  );
}
