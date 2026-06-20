import { useState } from "react";
import { useNavigate} from "react-router-dom"
import HeroHeader from "../../../shared/components/HeroHeader";
import HeroFooter from "../../../shared/components/HeroFooter";
import { validInput } from "../../../shared/utils/inputHandler";
import { forgotPassword } from "../service/authService";
import { toast } from "react-toastify";

export default function ForgotPasswordPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        token: "",
    });

    const [errors, setErrors] = useState({
        email: "",
        token: "",
    });

    const [loading, setLoading] = useState(false);
    const [showTokenModel, setShowTokenModel] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const emailError = validInput("email", formData.email);

        if (emailError) {
            setErrors({email: emailError, });
            return;
        }

        try {
            setLoading(true);
            const response = true;
            // const response = await forgotPassword({
            //     email: formData.email,
            // });
            toast.success(response.message || "Gửi liên kết đặt lại mật khẩu thành công");
            setShowTokenModel(true);

        } catch (err) {
            toast.error(err?.response?.data?.error || "Email không tồn tại trong hệ thống. Vui lòng kiểm tra lại.");

        } finally {
            setLoading(false);
        }
    };

    const handleTokenSubmit = async (e) => {
        e.preventDefault();

        const tokenError = validInput("token", formData.token);

        if (tokenError) {
            setErrors((prev) => ({
                ...prev,
                token: tokenError,
            }));
            return;
        }

        try {
            setLoading(true);
            // Cần gọi API check token để chuyển hướng.
            // const response = await forgotPassword({
            //     email: formData.token,
            // });
            toast.success("Xác thực thành công. Đang chuyển hướng...");
            navigate("/reset-password", {
                state: {
                    email: formData.email,
                    token: formData.token,
                }
            })
        } catch (err) {
            toast.error(
                err?.response?.data?.error ||
                "Có lỗi xảy ra, vui lòng thử lại."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col">
            <HeroHeader />

            <div className="flex flex-1 items-center justify-center px-4">
                <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-xl">

                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {showTokenModel ? "Reset your password" : "Enter Security Token"}
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            {!showTokenModel
                                ? "Enter your email address and we'll send you a link to reset your password."
                                : `We have sent a security token to ${formData.email}. Please check your email and enter the token here to reset your password.`}
                        </p>
                    </div>

                    {!showTokenModel ? (
                        <form
                            onSubmit={handleSubmit}
                            className="mt-8 flex flex-col items-center"
                        >
                            <div className="w-full max-w-md">
                                <label className="mb-2 block font-semibold text-gray-700">
                                    Email address
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    
                                    placeholder="candidate@example.com"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500"
                                />

                                {errors.email && (
                                    <p className="mt-1 text-sm font-semibold text-red-500">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-8 w-full max-w-md rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading
                                    ? "Sending..."
                                    : "Send Reset Link"}
                            </button>
                        </form>
                    ) : (
                        <form
                            onSubmit={handleTokenSubmit}
                            className="mt-8 flex flex-col items-center"
                        >
                            <div className="w-full max-w-md">
                                <label className="mb-2 block font-semibold text-gray-700">
                                    Enter Security Token
                                </label>

                                <input
                                    type="text"
                                    name="token"
                                    value={formData.token}
                                    onChange={handleChange}
                                    
                                    placeholder="Enter token"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500"
                                />

                                {errors.token && (
                                    <p className="mt-1 text-sm font-semibold text-red-500">
                                        {errors.token}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-8 w-full max-w-md rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading
                                    ? "Verifying..."
                                    : "Verify Token"}
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowTokenModel(false)
                                }
                                className="mt-4 text-sm text-gray-500 hover:text-indigo-600"
                            >
                                Return to use different email?
                            </button>
                        </form>
                    )}
                </div>
            </div>
            <HeroFooter />
        </div>
    );
}