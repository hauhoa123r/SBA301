import { useMemo, useState } from "react";
import { Eye, EyeOff, Info, LockKeyhole, Pencil, ReceiptText, Save, Ticket, UserRound } from "lucide-react";
import { toast } from "react-toastify";
import HeroHeader from "../../../shared/components/HeroHeader";
import HeroFooter from "../../../shared/components/HeroFooter";
import { useAuth } from "../../../app/provider/AuthProvider";

const menuGroups = [
    {
        title: "ACCOUNT",
        items: [
            { id: "profile", label: "Profile", icon: UserRound },
            { id: "password", label: "Change Password", icon: LockKeyhole },
        ],
    },
    {
        title: "PAYMENT",
        items: [{ id: "orders", label: "Order History", icon: ReceiptText }],
    },
    {
        title: "TOOLS",
        items: [{ id: "activation", label: "Activation Code", icon: Ticket }],
    },
];

const mockOrders = [
    { id: "EDJ-2401", course: "Full-Stack Web Development", date: "18/06/2026", total: "1.499.000đ", status: "Completed" },
    { id: "EDJ-2387", course: "UI/UX Design Mastery", date: "09/06/2026", total: "899.000đ", status: "Completed" },
    { id: "EDJ-2312", course: "Machine Learning & AI", date: "22/05/2026", total: "1.299.000đ", status: "Processing" },
];

export default function ViewProfilePage() {
    const { user, setUser } = useAuth();
    const [activeTab, setActiveTab] = useState("profile");
    const [showPasswords, setShowPasswords] = useState({ current: false, next: false, confirm: false });

    const profileDefaults = useMemo(
        () => ({
            avatar: user?.avatar || user?.avatarUrl || user?.image || "",
            fullName: user?.fullName || user?.name || "Hau Van Hoa",
            birthDate: user?.birthDate || "22/06/2004",
            email: user?.email || "anhgauday204@gmail.com",
            phone: user?.phone || "0987654321",
            occupation: user?.occupation || "",
            country: user?.country || "Vietnam",
        }),
        [user],
    );

    const [profile, setProfile] = useState(profileDefaults);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const displayName = profile.fullName || "Người học Edujar";

    const handleProfileChange = (event) => {
        const { name, value } = event.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => setProfile((prev) => ({ ...prev, avatar: reader.result }));
        reader.readAsDataURL(file);
    };

    const handleSaveProfile = (event) => {
        event.preventDefault();
        const nextUser = { ...user, ...profile };

        localStorage.setItem("user", JSON.stringify(nextUser));
        setUser(nextUser);
        toast.success("Profile updated.");
    };

    const handlePasswordChange = (event) => {
        const { name, value } = event.target;
        setPasswordForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleChangePassword = (event) => {
        event.preventDefault();
        if (passwordForm.newPassword.length < 8) {
            toast.error("New password must be at least 8 characters.");
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("Password confirmation does not match.");
            return;
        }

        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        toast.success("Password updated.");
    };

    const togglePassword = (field) => {
        setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <div className="flex min-h-screen flex-col bg-brand-dark font-sans text-brand-textPrimary">
            <HeroHeader />

            <main className="grid flex-grow grid-cols-1 px-5 py-10 xl:grid-cols-12 xl:px-0">
                <div className="flex w-full flex-col gap-6 lg:flex-row xl:col-span-10 xl:col-start-2">
                    <aside className="w-full shrink-0 rounded-2xl border border-brand-accent/10 bg-brand-cardBg p-3 shadow-2xl shadow-brand-accent/5 lg:w-72">
                        {menuGroups.map((group) => (
                            <div key={group.title} className="mb-7 last:mb-0">
                                <h2 className="px-3 pb-2 text-xs font-bold tracking-wide text-brand-profileMuted">{group.title}</h2>
                                <nav className="grid gap-2">
                                    {group.items.map(({ id, label, icon: Icon }) => (
                                        <button
                                            key={id}
                                            type="button"
                                            onClick={() => setActiveTab(id)}
                                            className={`flex h-12 items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold transition ${
                                                activeTab === id ? "bg-brand-accent/15 text-brand-accentPale" : "text-brand-textSecondary hover:bg-brand-light hover:text-brand-white"
                                            }`}
                                        >
                                            <Icon className="h-5 w-5 shrink-0" />
                                            <span className="truncate">{label}</span>
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        ))}
                    </aside>

                    <section className="min-w-0 flex-1 overflow-hidden rounded-[12px] border border-brand-accent/10 bg-brand-cardBg shadow-2xl shadow-brand-accent/5">
                        {activeTab === "profile" && (
                            <form onSubmit={handleSaveProfile}>
                                <PanelTitle title="Profile" />
                                <div className="px-6 py-6 md:px-8">
                                    <div className="relative mb-8 h-24 w-24">
                                        <div className="h-full w-full overflow-hidden rounded-full border border-brand-accent/20 bg-brand-light text-brand-accentSoft">
                                            {profile.avatar ? (
                                                <img src={profile.avatar} alt={displayName} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <UserRound className="h-16 w-16 stroke-[1.4]" />
                                                </div>
                                            )}
                                        </div>
                                        <label className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-[3px] border-brand-cardBg bg-brand-accent text-brand-white shadow-md shadow-brand-accent/30 transition hover:bg-brand-accentHover">
                                            <Pencil className="h-4 w-4" />
                                            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                        </label>
                                    </div>

                                    <div className="grid gap-x-5 gap-y-5 md:grid-cols-2">
                                        <ProfileField label="Full Name" required name="fullName" value={profile.fullName} onChange={handleProfileChange} />
                                        <ProfileField label="Date of Birth" required name="birthDate" value={profile.birthDate} onChange={handleProfileChange} />
                                        <ProfileField label="Email" required info value={profile.email} readOnly className="md:col-span-2" />
                                        <ProfileField label="Phone Number" value={profile.phone} readOnly />
                                        <ProfileField label="Occupation" name="occupation" value={profile.occupation} onChange={handleProfileChange} placeholder="Enter occupation" />
                                        <ProfileField label="Country" name="country" value={profile.country} onChange={handleProfileChange} placeholder="Enter country" />
                                    </div>

                                    <div className="mt-7 flex justify-end">
                                        <button type="submit" className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-accent px-5 text-sm font-bold text-brand-white transition hover:bg-brand-accentHover">
                                            <Save className="h-4 w-4" />
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}

                        {activeTab === "password" && (
                            <div>
                                <PanelTitle title="Change Password" />
                                <form onSubmit={handleChangePassword} className="grid max-w-2xl gap-5 px-6 py-6 md:px-8">
                                    <PasswordField
                                        label="Current Password"
                                        name="currentPassword"
                                        value={passwordForm.currentPassword}
                                        visible={showPasswords.current}
                                        onToggle={() => togglePassword("current")}
                                        onChange={handlePasswordChange}
                                    />
                                    <PasswordField
                                        label="New Password"
                                        name="newPassword"
                                        value={passwordForm.newPassword}
                                        visible={showPasswords.next}
                                        onToggle={() => togglePassword("next")}
                                        onChange={handlePasswordChange}
                                    />
                                    <PasswordField
                                        label="Confirm New Password"
                                        name="confirmPassword"
                                        value={passwordForm.confirmPassword}
                                        visible={showPasswords.confirm}
                                        onToggle={() => togglePassword("confirm")}
                                        onChange={handlePasswordChange}
                                    />
                                    <button type="submit" className="mt-2 w-fit rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-bold text-brand-white transition hover:bg-brand-accentHover">
                                        Update Password
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === "orders" && (
                            <div>
                                <PanelTitle title="Order History" />
                                <div className="px-6 py-6 md:px-8">
                                    <div className="overflow-hidden rounded-2xl border border-brand-accent/10">
                                        {mockOrders.map((order) => (
                                            <div key={order.id} className="grid gap-3 border-b border-brand-accent/10 bg-brand-light/40 p-4 last:border-b-0 md:grid-cols-[1fr_120px_120px_110px] md:items-center">
                                                <div>
                                                    <p className="text-sm font-bold text-brand-white">{order.course}</p>
                                                    <p className="mt-1 text-xs text-brand-textSecondary">Order ID: {order.id}</p>
                                                </div>
                                                <span className="text-xs text-brand-textSecondary">{order.date}</span>
                                                <span className="text-sm font-semibold text-brand-white">{order.total}</span>
                                                <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${order.status === "Completed" ? "bg-status-successPale text-status-successText" : "bg-status-warningPale text-status-warningText"}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "activation" && (
                            <div>
                                <PanelTitle title="Activation Code" />
                                <div className="px-6 py-6 md:px-8">
                                    <div className="rounded-2xl border border-dashed border-brand-accent/30 bg-brand-light/40 p-6 text-sm text-brand-textSecondary">
                                        Activation code features will be connected when the API is available.
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <HeroFooter />
        </div>
    );
}

function PanelTitle({ title }) {
    return (
        <div className="border-b border-brand-accent/10 px-5 py-4">
            <h1 className="text-xl font-bold text-brand-white">{title}</h1>
        </div>
    );
}

function ProfileField({ label, required = false, readOnly = false, info = false, className = "", ...props }) {
    return (
        <label className={`block ${className}`}>
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-textSecondary">
                {label}
                {info && <Info className="h-4 w-4 fill-brand-textSecondary text-brand-cardBg" />}
                {required && <span className="text-brand-danger">*</span>}
            </span>
            <input
                {...props}
                readOnly={readOnly}
                className={`h-11 w-full rounded-xl border px-4 text-sm font-medium outline-none transition placeholder:text-brand-profileMuted ${
                    readOnly
                        ? "cursor-not-allowed border-brand-accent/10 bg-brand-dark/60 text-brand-textSecondary"
                        : "border-brand-accent/20 bg-brand-light text-brand-white focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10"
                }`}
            />
        </label>
    );
}

function PasswordField({ label, visible, onToggle, ...props }) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-semibold text-brand-textSecondary">{label}</span>
            <div className="relative">
                <input
                    {...props}
                    required
                    type={visible ? "text" : "password"}
                    className="h-11 w-full rounded-xl border border-brand-accent/20 bg-brand-light px-4 pr-12 text-sm font-medium text-brand-white outline-none transition focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10"
                />
                <button type="button" onClick={onToggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-textSecondary transition hover:text-brand-white">
                    {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
        </label>
    );
}
