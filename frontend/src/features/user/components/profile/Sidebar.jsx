import { LockKeyhole, ReceiptText, Ticket, UserRound } from "lucide-react";

const menuGroups = [
    {
        title: "TÀI KHOẢN",
        items: [
            { id: "profile", label: "Hồ sơ cá nhân", icon: UserRound },
            { id: "password", label: "Đổi mật khẩu", icon: LockKeyhole },
        ],
    },
    {
        title: "THANH TOÁN",
        items: [{ id: "orders", label: "Lịch sử đơn hàng", icon: ReceiptText }],
    },
    {
        title: "CÔNG CỤ",
        items: [{ id: "activation", label: "Mã kích hoạt", icon: Ticket }],
    },
];

export default function Sidebar({ activeTab, onTabChange }) {
    return (
        <aside className="w-full shrink-0 rounded-lg border border-brand-accent/10 bg-brand-cardBg p-3 shadow-lg lg:w-72">
            {menuGroups.map((group) => (
                <div key={group.title} className="mb-6 last:mb-0">
                    <h2 className="px-3 pb-2 text-xs font-bold tracking-wide text-brand-profileMuted">{group.title}</h2>
                    <nav className="grid gap-1">
                        {group.items.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => onTabChange(item.id)}
                                className={`flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${activeTab === item.id ? "bg-brand-accent/15 text-brand-accentPale" : "text-brand-textSecondary hover:bg-brand-light"}`}
                            >
                                <item.icon className="h-5 w-5 shrink-0" />
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            ))}
        </aside>
    );
}
