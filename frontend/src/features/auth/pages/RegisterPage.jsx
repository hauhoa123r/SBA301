import HeroHeader from "../../../shared/components/HeroHeader";
import HeroFooter from "../../../shared/components/HeroFooter";

export default function RegisterPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <HeroHeader />
            <div className="flex flex-1 items-center justify-center px-4 py-8">
                <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-xl">
                    <div className="flex flex-col items-center">
                        <h1 className="mb-2 text-center text-3xl font-bold">
                            Create an Account
                        </h1>
                        <p className="mb-6 text-center text-gray-500">
                            Join our talent community to track your applications
                        </p>
                        <button
                            className="mb-3 w-full max-w-md rounded-lg border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-800 transition hover:bg-gray-50"
                        >
                            Continue with Google
                        </button>
                        <button
                            className="mb-4 w-full max-w-md rounded-lg border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-800 transition hover:bg-gray-50"
                        >
                            Continue with LinkedIn
                        </button>

                        <p className="mb-4 text-sm text-gray-500">
                            or register with email
                        </p>
                        <div className="w-full max-w-md">
                            <label className="mb-2 block text-sm font-semibold text-gray-500">
                                Full Name
                            </label>

                            <input
                                type="text"
                                placeholder="e.g Nguyen Van A"
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500"
                            />
                        </div>
                        <div className="mt-4 w-full max-w-md">
                            <label className="mb-2 block text-sm font-semibold text-gray-500">
                                Email Address
                            </label>

                            <input
                                type="email"
                                placeholder="e.g example@email.com"
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500"
                            />
                        </div>
                        <div className="mt-4 w-full max-w-md">
                            <label className="mb-2 block text-sm font-semibold text-gray-500">
                                Password
                            </label>

                            <input
                                type="password"
                                placeholder="*********"
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500"
                            />
                        </div>
                        <button
                            className="mt-6 w-full max-w-md rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700"
                        >
                            Create Account
                        </button>
                        <div className="mt-4 text-center">
                            <p className="text-gray-500">
                                Already have an account?{" "}
                                <a
                                    href="/login"
                                    className="font-semibold text-indigo-600 hover:text-indigo-700"
                                >
                                    Sign In
                                </a>
                            </p>
                        </div>

                    </div>
                </div>
            </div>
            <HeroFooter />
        </div>
    );
}