import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import useAuth from "../../../app/provider/useAuth";
import { changePassword, getUserProfile, updateUserProfile } from "../services/userProfileService";
import { validateChangePassword } from "../shared/utils/validator";
import ActivationCode from "../components/profile/ActivationCode";
import ChangePassword from "../components/profile/ChangePassword";
import OrderHistory from "../components/profile/OrderHistory";
import Profile from "../components/profile/Profile";
import Sidebar from "../components/profile/Sidebar.jsx";
import UserReveal from "../../../shared/components/animation/UserReveal";

const tabTitles = {
    profile: "Hồ sơ cá nhân",
    password: "Đổi mật khẩu",
    orders: "Lịch sử đơn hàng",
    activation: "Mã kích hoạt",
};

export default function ViewProfilePage() {
    const { user, setUser } = useAuth();
    const [activeTab, setActiveTab] = useState("profile");
    const [profile, setProfile] = useState(() => ({
        id: user?.id ?? "",
        fullName: user?.fullName ?? "",
        email: user?.email ?? "",
        status: user?.status ?? "",
        totalLearningPoints: user?.totalLearningPoints ?? 0,
        referralCode: user?.referralCode ?? "",
        createdAt: user?.createdAt ?? "",
        updatedAt: user?.updatedAt ?? "",
    }));
    const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [showPasswords, setShowPasswords] = useState({ current: false, next: false, confirm: false });
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const userId = user?.id;

    const getError = (error, fallback) => {
        const data = error?.response?.data;
        if (typeof data === "string") return data;
        if (data?.message) return data.message;
        return error?.message || fallback;
    };

    useEffect(() => {
        if (!userId) return;
        const controller = new AbortController();

        async function loadProfile() {
            setIsLoading(true);
            setErrorMsg("");
            try {
                const data = await getUserProfile(userId);
                setProfile(data);
                setUser((prev) => {
                    const nextUser = { ...prev, ...data };
                    localStorage.setItem("user", JSON.stringify(nextUser));
                    return nextUser;
                });
            } catch (error) {
                if (!controller.signal.aborted) {
                    setErrorMsg(getError(error, "Không thể tải hồ sơ."));
                }
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        }

        loadProfile();
        return () => controller.abort();
    }, [userId, setUser]);

    const handleInputChange = (e, formType = "profile") => {
        const { name, value } = e.target;
        if (formType === "profile") {
            setProfile((prev) => ({ ...prev, [name]: value }));
        } else {
            setPasswordForm((prev) => ({ ...prev, [name]: value }));
            if (errorMsg) setErrorMsg("");
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!profile.fullName.trim()) return toast.error("Vui lòng nhập họ và tên.");

        setIsSaving(true);
        try {
            const data = await updateUserProfile(userId, { fullName: profile.fullName.trim() });
            const nextUser = { ...user, ...data };
            setProfile(data);
            setUser(nextUser);
            localStorage.setItem("user", JSON.stringify(nextUser));
            toast.success("Cập nhật hồ sơ thành công!");
        } catch (error) {
            toast.error(getError(error, "Không thể cập nhật hồ sơ."));
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        const invalid = validateChangePassword(passwordForm.currentPassword, passwordForm.newPassword, passwordForm.confirmPassword);
        if (invalid) return setErrorMsg(invalid);

        setIsSaving(true);
        try {
            await changePassword({
                email: profile.email,
                current_password: passwordForm.currentPassword,
                new_password: passwordForm.newPassword,
                confirm_password: passwordForm.confirmPassword,
            });
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            toast.success("Cập nhật mật khẩu thành công!");
        } catch (error) {
            setErrorMsg(getError(error, "Không thể cập nhật mật khẩu."));
        } finally {
            setIsSaving(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setErrorMsg("");
    };

    const formatDate = (val) => val ? new Date(val).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "Chưa có";

    return (
        <div className="user-ui-scope mx-auto w-full max-w-7xl px-4 py-8 font-sans text-brand-textPrimary sm:px-6 lg:py-12">
            <div className="grid w-full gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                <UserReveal className="lg:sticky lg:top-28 lg:self-start" distance={20}>
                    <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
                </UserReveal>

                <UserReveal as="section" className="min-w-0 overflow-hidden rounded-2xl border border-brand-accent/10 bg-brand-cardBg shadow-xl shadow-brand-black/20" delay={80} distance={20}>
                    <div className="border-b border-brand-accent/10 px-6 py-4">
                        <h1 className="text-xl font-bold text-brand-white">{tabTitles[activeTab]}</h1>
                    </div>

                    <div className="p-6 md:p-8">
                        {errorMsg && (
                            <div role="alert" aria-live="polite" className="mb-5 flex gap-3 rounded-xl border border-brand-danger/30 bg-brand-danger/10 p-4 text-sm text-brand-textSecondary">
                                <AlertCircle className="h-5 w-5 shrink-0 text-brand-danger" />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        <UserReveal key={activeTab} id={`${activeTab}-panel`} distance={12} duration={450}>
                            {activeTab === "profile" && (
                                <Profile
                                    profile={profile}
                                    isLoading={isLoading}
                                    isSaving={isSaving}
                                    userId={userId}
                                    onInputChange={handleInputChange}
                                    onSaveProfile={handleSaveProfile}
                                    formatDate={formatDate}
                                />
                            )}

                            {activeTab === "password" && (
                                <ChangePassword
                                    passwordForm={passwordForm}
                                    showPasswords={showPasswords}
                                    setShowPasswords={setShowPasswords}
                                    isSaving={isSaving}
                                    onInputChange={handleInputChange}
                                    onChangePassword={handleChangePassword}
                                />
                            )}

                            {activeTab === "orders" && <OrderHistory />}
                            {activeTab === "activation" && <ActivationCode />}
                        </UserReveal>
                    </div>
                </UserReveal>
            </div>
        </div>
    );
}
