import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ModeratorLayout from "../components/ModeratorLayout";
import { MODERATOR_FEATURES } from "../data/moderatorFeatures";

export default function ModeratorDashboardPage() {
    return (
        <ModeratorLayout
            title="Bảng điều khiển kiểm duyệt"
        >
            <section className="mb-6 grid gap-4 md:grid-cols-3">
                {[
                    { label: "Tác vụ khóa học", value: "28", note: "Duyệt, phê duyệt, từ chối, ẩn" },
                    { label: "Báo cáo vi phạm", value: "14", note: "Đang mở và đang xác minh" },
                    { label: "Hàng đợi hoàn tiền", value: "9", note: "Chờ xử lý giao dịch" },
                ].map((item) => (
                    <article key={item.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-semibold text-slate-500">{item.label}</p>
                        <strong className="mt-2 block text-3xl text-slate-950">{item.value}</strong>
                        <p className="mt-2 text-sm text-slate-600">{item.note}</p>
                    </article>
                ))}
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {MODERATOR_FEATURES.map((feature) => {
                    const Icon = feature.icon;

                    return (
                        <Link
                            key={feature.title}
                            to={feature.path}
                            className="group rounded-lg border border-slate-200 bg-white p-5 text-slate-950 no-underline shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
                        >
                            <div className="mb-5 flex items-center justify-between">
                                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-lg ${feature.bg} ${feature.tone}`}>
                                    <Icon className="h-5 w-5" />
                                </span>
                                <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-violet-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-slate-950">{feature.title}</h2>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
                        </Link>
                    );
                })}
            </section>
        </ModeratorLayout>
    );
}
