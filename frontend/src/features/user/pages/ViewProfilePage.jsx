import { useCallback, useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/features/auth";
import { changePassword, getOrderHistory, getUserProfile, updateUserProfile } from "../services/userProfileService";
import { validateChangePassword } from "../shared/utils/validator";
import ActivationCode from "../components/profile/ActivationCode";
import ChangePassword from "../components/profile/ChangePassword";
import OrderHistory from "../components/profile/OrderHistory";
import Profile from "../components/profile/Profile";
import Sidebar from "../components/profile/Sidebar.jsx";
import { UserReveal } from "@/shared/ui";

const tabTitles = {
    profile: "Hồ sơ cá nhân",
    password: "Đổi mật khẩu",
    orders: "Lịch sử đơn hàng",
    activation: "Mã kích hoạt",
};

const emptyPasswordForm = { currentPassword: "", newPassword: "", confirmPassword: "" };

const buildProfile = (user) => ({
    id: user?.id ?? "",
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    status: user?.status ?? "",
    totalLearningPoints: user?.totalLearningPoints ?? 0,
    referralCode: user?.referralCode ?? "",
    createdAt: user?.createdAt ?? "",
    updatedAt: user?.updatedAt ?? "",
});

const getError = (error, fallback) => {
    const data = error?.response?.data;
    if (typeof data === "string") return data;
    if (data?.message) return data.message;
    return error?.message || fallback;
};

const formatDate = (val) =>
    val
        ? new Date(val).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
        : "Chưa có";

export default function ViewProfilePage() {
    const { user, setUser } = useAuth();
    const [activeTab, setActiveTab] = useState("profile");
    const [profile, setProfile] = useState(() => buildProfile(user));
    const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
    const [orders, setOrders] = useState([]);
    const [showPasswords, setShowPasswords] = useState({ current: false, next: false, confirm: false });
    const [isLoading, setIsLoading] = useState(false);
    const [isOrdersLoading, setIsOrdersLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const userId = user?.id;

    const syncUserProfile = useCallback((data) => {
        setProfile(data);
        setUser((prev) => {
            const nextUser = { ...prev, ...data };
            localStorage.setItem("user", JSON.stringify(nextUser));
            return nextUser;
        });
    }, [setUser]);

    useEffect(() => {
        if (!userId) return;
        let ignore = false;

        async function loadProfile() {
            setIsLoading(true);
            setErrorMsg("");
            try {
                const data = await getUserProfile(userId);
                if (!ignore) syncUserProfile(data);
            } catch (error) {
                if (!ignore) setErrorMsg(getError(error, "Không thể tải hồ sơ."));
            } finally {
                if (!ignore) setIsLoading(false);
            }
        }

        loadProfile();
        return () => {
            ignore = true;
        };
    }, [userId, syncUserProfile]);

    useEffect(() => {
        if (!userId || activeTab !== "orders") return;
        let ignore = false;

        async function loadOrders() {
            setIsOrdersLoading(true);
            setErrorMsg("");
            try {
                const data = await getOrderHistory(userId);
                if (!ignore) setOrders(Array.isArray(data) ? data : []);
            } catch (error) {
                if (!ignore) setErrorMsg(getError(error, "Không thể tải lịch sử đơn hàng."));
            } finally {
                if (!ignore) setIsOrdersLoading(false);
            }
        }

        loadOrders();
        return () => {
            ignore = true;
        };
    }, [activeTab, userId]);

    const handleInputChange = (e, formType = "profile") => {
        const { name, value } = e.target;
        const setForm = formType === "profile" ? setProfile : setPasswordForm;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (formType !== "profile" && errorMsg) setErrorMsg("");
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        const fullName = profile.fullName.trim();
        if (!fullName) return toast.error("Vui lòng nhập họ và tên.");

        setIsSaving(true);
        try {
            const data = await updateUserProfile(userId, { fullName });
            syncUserProfile(data);
            toast.success("Cập nhật hồ sơ thành công!");
        } catch (error) {
            toast.error(getError(error, "Không thể cập nhật hồ sơ."));
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        const { currentPassword, newPassword, confirmPassword } = passwordForm;
        const invalid = validateChangePassword(currentPassword, newPassword, confirmPassword);
        if (invalid) return setErrorMsg(invalid);

        setIsSaving(true);
        try {
            await changePassword({
                email: profile.email,
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
            });
            setPasswordForm(emptyPasswordForm);
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

                            {activeTab === "orders" && (
                                <OrderHistory
                                    orders={orders}
                                    isLoading={isOrdersLoading}
                                />
                            )}
                            {activeTab === "activation" && <ActivationCode />}
                        </UserReveal>
                    </div>
                </UserReveal>
            </div>
        </div>
    );
}
