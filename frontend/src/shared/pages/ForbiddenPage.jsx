import { ArrowLeft, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ForbiddenPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>
            <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center">
                <section className="w-full rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
                    <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                        <ShieldAlert className="h-6 w-6" />
                    </div>
                    <p className="mb-2 text-sm font-semibold uppercase text-violet-600">
                        Access restricted
                    </p>
                    <h1 className="text-3xl font-bold text-slate-950">
                        Can co quyen moderator
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                        Khu vuc nay chi danh cho tai khoan co role moderator. Neu dang nhap bang tai khoan learner, he thong se khong cho vao trang nay.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Ve trang chu
                    </button>
                </section>
            </main>
        </div>
    );
}
