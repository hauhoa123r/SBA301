import { ReceiptText } from "lucide-react";

export default function OrderHistory() {
    return (
        <div className="flex gap-4 rounded-lg border border-dashed border-brand-accent/30 bg-brand-light/40 p-6 text-sm">
            <ReceiptText className="h-5 w-5 text-brand-accentPale" />
            <div>
                <p className="font-bold text-brand-white">Chưa kết nối dữ liệu</p>
                <p className="mt-1 text-brand-textSecondary">Tính năng API này chưa được liên kết hoặc hiện chưa khả dụng.</p>
            </div>
        </div>
    );
}
