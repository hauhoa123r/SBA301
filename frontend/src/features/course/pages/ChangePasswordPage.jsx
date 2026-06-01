import React, {useState, useEffect} from 'react';
import {useNavigate, useLocation} from 'react-router-dom'
import HeroHeader from "../../../shared/components/HeroHeader";
import HeroFooter from "../../../shared/components/HeroFooter";
import {toast} from "react-toastify";


export default function ChangePasswordPage({mode = 'change'}) {
    const navigate = useNavigate();
    const location = useLocation();
    const {email, token} = location.state || {};

    const [formData, setFormData] = useState({
        current_password: "", new_password: "", confirm_password: "",
    });

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const EyeIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
            <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
            <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
        </svg>);
    const EyeSlashIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
            <path
                d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709zM11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
            <path
                d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
        </svg>);

    useEffect(() => {
        if (mode === 'reset' && (!email || !token)) {
            toast.error("Phiên làm việc không hợp lệ...");
            navigate("/forgot-password", {replace: true});
        }
    }, [mode, email, token, navigate]);

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.new_password !== formData.confirm_password) {
            toast.error("Xác nhận mật khẩu không đúng.");
            return;
        } else if (mode === 'reset') {
            toast.success("Đặt lại mật khẩu thảnh công!");
            navigate("/login", {replace: true});
        } else {
            toast.success("Thay đổi mật khẩu thảnh công!");
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-brand-dark font-sans text-brand-textPrimary">
            <HeroHeader/>
            <main className="flex-grow flex items-center justify-center p-6">
                <div
                    className="w-full max-w-md bg-brand-cardBg rounded-3xl p-8 shadow-2xl border border-brand-textSecondary/10">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-brand-textPrimary tracking-wide">
                            {mode === 'change' ? "Change Password" : "Reset Password"}
                        </h2>
                    </div>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        {mode === 'change' && (
                            <div className="relative">
                                <input
                                    className="w-full bg-transparent border-b border-brand-textSecondary/40 pb-2 text-brand-textPrimary placeholder-brand-textSecondary/60 focus:outline-none focus:border-brand-accent transition-colors pr-10"
                                    name="current_password"
                                    value={formData.current_password}
                                    onChange={handleChange}
                                    type={showOldPassword ? "text" : "password"}
                                    placeholder="Current Password"
                                    required={true}/>
                                <button type="button"
                                        className="absolute right-0 top-0 text-brand-textSecondary hover:text-brand-accent transition-colors"
                                        onClick={() => setShowOldPassword(!showOldPassword)}>
                                    {showOldPassword ? <EyeIcon/> : <EyeSlashIcon/>}
                                </button>
                            </div>)}
                        <div className="relative">
                            <input
                                name="new_password" required={true}
                                value={formData.new_password}
                                onChange={handleChange}
                                type={showNewPassword ? "text" : "password"} placeholder="New Password"
                                className="w-full bg-transparent border-b border-brand-textSecondary/40 pb-2 text-brand-textPrimary placeholder-brand-textSecondary/60 focus:outline-none focus:border-brand-accent transition-colors pr-10"/>
                            <button type="button"
                                    className="absolute right-0 top-0 text-brand-textSecondary hover:text-brand-accent transition-colors"
                                    onClick={() => setShowNewPassword(!showNewPassword)}>
                                {showNewPassword ? <EyeIcon/> : <EyeSlashIcon/>}
                            </button>
                        </div>
                        <div className="relative">
                            <input
                                name="confirm_password" required={true}
                                value={formData.confirm_password}
                                onChange={handleChange}
                                type={showConfirmPassword ? "text" : "password"} placeholder="Confirm New Password"
                                className="w-full bg-transparent border-b border-brand-textSecondary/40 pb-2 text-brand-textPrimary placeholder-brand-textSecondary/60 focus:outline-none focus:border-brand-accent transition-colors pr-10"/>
                            <button type="button"
                                    className="absolute right-0 top-0 text-brand-textSecondary hover:text-brand-accent transition-colors"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <EyeIcon/> : <EyeSlashIcon/>}
                            </button>
                        </div>
                        <button
                            className="w-full mt-4 bg-brand-accent hover:bg-brand-accentHover text-white py-3 rounded-full font-semibold transition-all shadow-lg shadow-brand-accent/25 hover:shadow-brand-accentHover/40 active:scale-95"
                            type="submit">
                            {mode === 'change' ? "Save Changes" : "Reset Password"}
                        </button>
                    </form>
                </div>
            </main>
            <HeroFooter/>
        </div>);
}