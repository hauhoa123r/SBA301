import { Copy } from "lucide-react";

export default function PaymentRow({ label, value, copyValue, onCopy, highlight = false }) {
    return (
        <div className="grid gap-3 border-b border-brand-accent/10 px-5 py-5 sm:grid-cols-[150px_minmax(0,1fr)_48px] sm:items-center">
            <span className="text-sm font-bold text-brand-textSecondary">{label}</span>
            <span className={`text-base font-black sm:text-right ${highlight ? "text-brand-accentPale" : "text-brand-white"}`}>
                {value}
            </span>
            {copyValue ? (
                <button type="button" onClick={() => onCopy(copyValue)} className="grid h-11 w-11 place-items-center rounded-full bg-brand-light text-brand-textSecondary transition hover:bg-brand-accent hover:text-brand-white sm:justify-self-end" aria-label={`Sao chép ${label}`}>
                    <Copy className="h-5 w-5" />
                </button>
            ) : (
                <span className="hidden sm:block" />
            )}
        </div>
    );
}
