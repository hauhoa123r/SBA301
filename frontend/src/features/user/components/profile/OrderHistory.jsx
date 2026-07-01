import { ReceiptText } from "lucide-react";

export default function OrderHistory() {
    return (
        <div className="flex gap-4 rounded-lg border border-dashed border-brand-accent/30 bg-brand-light/40 p-6 text-sm">
            <ReceiptText className="h-5 w-5 text-brand-accentPale" />
            <div>
                <p className="font-bold text-brand-white">No Endpoint Connected</p>
                <p className="mt-1 text-brand-textSecondary">This API feature is not yet linked or currently unavailable.</p>
            </div>
        </div>
    );
}
