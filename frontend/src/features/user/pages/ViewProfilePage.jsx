import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../../app/provider/AuthProvider";
import { changePassword, getUserProfile, updateUserProfile } from "../services/userProfileService";
import { validateChangePassword } from "../shared/utils/validator";
import ActivationCode from "../components/profile/ActivationCode";
import ChangePassword from "../components/profile/ChangePassword";
import OrderHistory from "../components/profile/OrderHistory";
import Profile from "../components/profile/Profile";
import Sidebar from "../components/profile/Sidebar.jsx";

const tabTitles = {
    profile: "Profile",
    password: "Change Password",
    orders: "Order History",
    activation: "Activation Code",
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
                    setErrorMsg(getError(error, "Could not load profile."));
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
        if (!profile.fullName.trim()) return toast.error("Full name is required.");

        setIsSaving(true);
        try {
            const data = await updateUserProfile(userId, { fullName: profile.fullName.trim() });
            const nextUser = { ...user, ...data };
            setProfile(data);
            setUser(nextUser);
            localStorage.setItem("user", JSON.stringify(nextUser));
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error(getError(error, "Could not update profile."));
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
            toast.success("Password updated successfully!");
        } catch (error) {
            setErrorMsg(getError(error, "Could not update password."));
        } finally {
            setIsSaving(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setErrorMsg("");
    };

    const formatDate = (val) => val ? new Date(val).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "N/A";

    return (
        <div className="grid grid-cols-1 px-5 py-10 font-sans text-brand-textPrimary xl:grid-cols-12 xl:px-0">
            <div className="flex w-full flex-col gap-6 lg:flex-row xl:col-span-10 xl:col-start-2">
                <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />

                <section className="min-w-0 flex-1 rounded-lg border border-brand-accent/10 bg-brand-cardBg shadow-xl">
                    <div className="border-b border-brand-accent/10 px-6 py-4">
                        <h1 className="text-xl font-bold text-brand-white">{tabTitles[activeTab]}</h1>
                    </div>

                    <div className="p-6 md:p-8">
                        {errorMsg && (
                            <div className="mb-5 flex gap-3 rounded-lg border border-brand-danger/30 bg-brand-danger/10 p-4 text-sm text-brand-textSecondary">
                                <AlertCircle className="h-5 w-5 shrink-0 text-brand-danger" />
                                <span>{errorMsg}</span>
                            </div>
                        )}

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
                    </div>
                </section>
            </div>
        </div>
    );
}
