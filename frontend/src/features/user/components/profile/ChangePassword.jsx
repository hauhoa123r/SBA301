import { Eye, EyeOff, LockKeyhole, RefreshCw } from "lucide-react";

const baseInputClass = "h-11 w-full rounded-lg border border-brand-accent/20 bg-brand-light px-4 text-sm font-medium text-brand-white outline-none transition placeholder:text-brand-profileMuted focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10";
const fieldLabelClass = "mb-2 flex items-center gap-2 text-sm font-semibold text-brand-textSecondary";


export default function ChangePassword({ passwordForm, showPasswords, setShowPasswords, isSaving, onInputChange, onChangePassword }) {
    const passwordFields = [
        { name: "currentPassword", label: "Current Password", typeKey: "current" },
        { name: "newPassword", label: "New Password", typeKey: "next" },
        { name: "confirmPassword", label: "Confirm New Password", typeKey: "confirm" },
    ];
    return (
        <form onSubmit={onChangePassword} className="grid max-w-xl gap-5">
            {passwordFields.map((field) => (
                <label key={field.name} className="block">
                    <span className={fieldLabelClass}>{field.label}</span>
                    <div className="relative">
                        <input
                            type={showPasswords[field.typeKey] ? "text" : "password"}
                            name={field.name}
                            value={passwordForm[field.name]}
                            onChange={(e) => onInputChange(e, "password")}
                            className={`${baseInputClass} pr-12`}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPasswords((prev) => ({ ...prev, [field.typeKey]: !prev[field.typeKey] }))}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-textSecondary"
                        >
                            {showPasswords[field.typeKey] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </label>
            ))}
            <button type="submit" disabled={isSaving} className="mt-2 inline-flex w-fit items-center gap-2 rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-bold text-brand-white hover:bg-brand-accentHover disabled:opacity-50">
                {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
                {isSaving ? "Updating..." : "Update Password"}
            </button>
        </form>
    );
}
