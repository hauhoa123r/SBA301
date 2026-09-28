import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export default function LearningMessage({ title, message, showCatalogLink = false }) {
    return (
        <section className="mx-auto mt-10 flex min-h-72 max-w-2xl flex-col items-center justify-center border-y border-brand-accent/15 px-5 py-10 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-light text-brand-accentSoft">
                <BookOpen aria-hidden="true" className="h-7 w-7" />
            </span>
            <h2 className="mt-5 text-xl font-black text-brand-white">{title}</h2>
            <p className="mt-2 text-sm text-brand-textSecondary">{message}</p>
            {showCatalogLink && (
                <Link to="/subscriptions" className="mt-6 rounded-lg bg-brand-accent px-5 py-3 text-sm font-black text-brand-white no-underline hover:bg-brand-accentHover">
                    Xem gói học
                </Link>
            )}
        </section>
    );
}
