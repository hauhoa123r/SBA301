import { useState } from "react";
import HeroHeader from "../../../shared/components/HeroHeader";
import HeroFooter from "../../../shared/components/HeroFooter";
import { validInput } from "../../../shared/utils/inputHandler";
import { login } from "../service/authService";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({...prev,[name]: value,}));
        if (errors[name]) {
            setErrors((prev) => ({...prev,[name]: "",}));
        }
    };
    const handleBlur = (e) => {
        const { name, value } = e.target;
        const errorMessage = validInput(name, value);
        setErrors((prev) => ({...prev,[name]: errorMessage,}));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const emailError = validInput("email", formData.email);
        const passwordError = validInput("password", formData.password);
        if (emailError || passwordError) {
            setErrors({
                email: emailError,
                password: passwordError,
            });
            return;
        }
        try {
            const response = await login(formData);
            localStorage.setItem("user", JSON.stringify(response));
            toast.success("Đăng nhập thành công");
            navigate("/");
        } catch (err) {
            const errMsg = err.response?.data?.error || "Đăng nhập thất bại";
            toast.error(errMsg);
            navigate("/404");
        }
    };
    return (
        <div className="flex min-h-screen flex-col">
            <HeroHeader />
            <div className="flex flex-1 items-center justify-center p-4 overflow-auto">
                <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">
                    <div className="flex min-h-[580px] flex-col justify-between p-10">
                        <div>
                            <h2 className="mb-2 text-3xl font-bold">
                                Login
                            </h2>
                            <p className="mb-8 text-sm text-gray-500">
                                Enter your account details
                            </p>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-6">
                                    <input
                                        type="text"
                                        placeholder="Email Address"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className="w-full border-b border-gray-300 bg-transparent py-3 outline-none focus:border-purple-500"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm font-semibold text-red-500">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>
                                <div className="relative mb-6">
                                    <input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        placeholder="Password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className="w-full border-b border-gray-300 bg-transparent py-3 pr-10 outline-none focus:border-purple-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-3 text-gray-500"
                                    >
                                        {showPassword ? (
                                           <img
                                           src="../../../../public/icons/eye-closed-svgrepo-com.svg"
                                           className="h-5 w-5"
                                           alt="Eye Closed"
                                           ></img>
                                        ) : (
                                                <img
                                                    src="../../../../public/icons/eye-open-svgrepo-com.svg"
                                                    className="h-5 w-5"
                                                    alt="Eye Open"
                                                ></img>
                                        )}
                                    </button>
                                    {errors.password && (
                                        <p className="mt-1 text-sm font-semibold text-red-500">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>
                                <div className="mb-6">
                                    <Link
                                        to ="/forgot-password"
                                        className="text-sm text-gray-500 hover:text-purple-600"
                                    >
                                        Forgot Password?
                                    </Link>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full rounded-xl bg-purple-600 py-3 font-medium text-white transition hover:bg-purple-700"
                                >
                                    Login
                                </button>
                            </form>
                        </div>

                        <div className="mt-6 flex items-center gap-3">
                            <span className="text-sm text-gray-500">
                                Don't have an account?
                            </span>
                            <Link to="/register" className="rounded-lg bg-brand-accent text-white px-5 py-2 font-semibold cursor-pointer transition hover:bg-white hover:text-brand-accent border border-brand-accent">
                                Sign up
                            </Link>
                        </div>
                    </div>
                    <div className="flex flex-col justify-between bg-gradient-to-br from-purple-600 to-indigo-700 p-10 text-white">
                        <div>
                            <h1 className="text-4xl font-bold"> Welcome to </h1>
                            <h1 className="text-4xl font-bold"> student portal </h1>
                             <p className="mt-3 text-purple-100"> Login to access your account </p>
                        </div>
                        <div className="mt-10 flex justify-center">
                            <img src="/images/undraw_morning-news_h9nz.svg" alt="Illustration" className="max-h-80"/>
                        </div>
                    </div>
                </div>
            </div>
            <HeroFooter />
        </div>
    );
};
export default LoginPage;