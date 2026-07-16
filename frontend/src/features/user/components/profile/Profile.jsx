import { Info, KeyRound, RefreshCw, Save, ShieldCheck } from "lucide-react";

const baseInputClass = "h-11 w-full rounded-lg border border-brand-accent/20 bg-brand-light px-4 text-sm font-medium text-brand-white outline-none transition placeholder:text-brand-profileMuted focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10";
const readOnlyInputClass = "h-11 w-full cursor-not-allowed rounded-lg border border-brand-accent/10 bg-brand-dark/60 px-4 text-sm font-medium text-brand-textSecondary outline-none";
const fieldLabelClass = "mb-2 flex items-center gap-2 text-sm font-semibold text-brand-textSecondary";

export default function Profile({ profile, isLoading, isSaving, userId, onInputChange, onSaveProfile, formatDate }) {
    return (
        <form onSubmit={onSaveProfile}>
            <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center">
                <div aria-hidden="true" className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-light text-2xl font-bold text-brand-accentSoft ring-4 ring-brand-accent/10">
                    {profile.fullName?.charAt(0).toUpperCase() || "?"}
                </div>
                <div>
                    <p className="text-xl font-bold text-brand-white">{profile.fullName || "Người dùng"}</p>
                    <p className="text-sm text-brand-textSecondary">{profile.email}</p>
                    <div className="mt-2 flex gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded bg-brand-light px-2.5 py-1 text-xs font-bold">
                            <ShieldCheck className="h-3.5 w-3.5" /> {profile.status || "Đang hoạt động"}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded bg-brand-light px-2.5 py-1 text-xs font-bold">
                            <KeyRound className="h-3.5 w-3.5" /> ID: {profile.id}
                        </span>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 animate-pulse">
                    {[...Array(6)].map((_, i) => <div key={i} className="h-16 rounded bg-brand-light/50" />)}
                </div>
            ) : (
                <>
                    <div className="grid gap-5 md:grid-cols-2">
                        <label className="block">
                            <span className={fieldLabelClass}>Họ và tên <span className="text-brand-danger">*</span></span>
                            <input type="text" name="fullName" value={profile.fullName} onChange={(e) => onInputChange(e, "profile")} className={baseInputClass} autoComplete="name" required />
                        </label>
                        <label className="block">
                            <span className={fieldLabelClass}>Email <Info className="h-4 w-4" /></span>
                            <input type="text" value={profile.email} className={readOnlyInputClass} readOnly />
                        </label>
                        <label className="block">
                            <span className={fieldLabelClass}>Trạng thái</span>
                            <input type="text" value={profile.status} className={readOnlyInputClass} readOnly />
                        </label>
                        <label className="block">
                            <span className={fieldLabelClass}>Điểm học tập</span>
                            <input type="text" value={profile.totalLearningPoints} className={readOnlyInputClass} readOnly />
                        </label>
                        <label className="block">
                            <span className={fieldLabelClass}>Ngày tạo</span>
                            <input type="text" value={formatDate(profile.createdAt)} className={readOnlyInputClass} readOnly />
                        </label>
                        <label className="block">
                            <span className={fieldLabelClass}>Cập nhật lần cuối</span>
                            <input type="text" value={formatDate(profile.updatedAt)} className={readOnlyInputClass} readOnly />
                        </label>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button type="submit" disabled={isSaving || !userId} className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-accent px-5 text-sm font-bold text-brand-white shadow-lg shadow-brand-accent/20 transition hover:bg-brand-accentHover disabled:cursor-not-allowed disabled:opacity-50">
                            {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                    </div>
                </>
            )}
        </form>
    );
}
