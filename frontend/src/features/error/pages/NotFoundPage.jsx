import { useNavigate } from "react-router-dom";

const Page404 = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen flex items-center py-10 px-4">
            <div className="mx-auto w-full max-w-7xl">
                <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
                    <div>

                        <h1
                            className="m-0 text-[8rem] font-bold leading-none bg-gradient-to-r from-purple-600 to-purple-300 bg-clip-text text-transparent"
                        >
                            404
                        </h1>

                        <h2 className="mb-4 text-4xl font-bold text-slate-900">
                            Oops! This page
                            <br />
                            got lost in{" "}
                            <span className="text-5xl text-purple-600">
                                translation.
                            </span>
                        </h2>

                        <p className="mb-6 max-w-md text-lg text-gray-500">
                            The page you're looking for doesn't exist or has
                            been moved. Let's get you back on track!
                        </p>
                        <div className="mb-8 flex flex-wrap gap-3">

                            <button
                                onClick={() => navigate(-1)}
                                className="rounded-xl bg-purple-600 px-6 py-3 text-white transition hover:bg-purple-700"
                            >
                                Go Back
                            </button>

                            <button
                                onClick={() => navigate("/")}
                                className="rounded-xl border border-purple-200 px-6 py-3 text-purple-600 transition hover:bg-purple-50"
                            >
                                Back to Home
                            </button>

                        </div>
                        <div className="mb-6 max-w-xl rounded-2xl bg-purple-50 p-5">

                            <p className="mb-3 text-sm font-bold text-gray-500">
                                Maybe you were looking for:
                            </p>

                            <div className="grid grid-cols-2 gap-3 text-sm">

                                <button
                                    onClick={() => navigate("/courses")}
                                    className="text-left text-gray-600 hover:text-purple-600"
                                >
                                    keyword
                                </button>

                                <button
                                    onClick={() => navigate("/my-learning")}
                                    className="text-left text-gray-600 hover:text-purple-600"
                                >
                                    keyword
                                </button>

                                <button
                                    onClick={() => navigate("/vocabulary")}
                                    className="text-left text-gray-600 hover:text-purple-600"
                                >
                                    keyword
                                </button>

                            </div>
                        </div>
                        <div className="flex max-w-xl items-center justify-between rounded-2xl border border-gray-200 bg-white p-4">

                            <div className="flex items-center gap-3">

                                <div className="h-10 w-10 rounded-full bg-purple-50"></div>

                                <div>
                                    <div className="text-sm font-bold">
                                        Still need help?
                                    </div>

                                    <div className="text-xs text-gray-500">
                                        Our support team is here for you.
                                    </div>
                                </div>

                            </div>

                            <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm transition hover:bg-gray-100">
                                Contact Support
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <img
                            src="/images/image_404.png"
                            alt="404"
                            className="max-h-[600px] w-full object-contain"
                        />
                    </div>

                </div>

            </div>
        </div>
    );
};

export default Page404;