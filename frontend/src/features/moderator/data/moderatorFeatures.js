import {
    ClipboardList,
    Eye,
    ReceiptText,
} from "lucide-react";

export const MODERATOR_FEATURES = [
    {
        title: "Course Management",
        description: "Review and manage pending, approved, rejected, and hidden courses in one place.",
        path: "/moderator/courses",
        icon: Eye,
        tone: "text-sky-600",
        bg: "bg-sky-50",
    },
    {
        title: "Manage Violation Reports",
        description: "Xu ly report vi pham, xem bang chung, resolve hoac dismiss case khong hop le.",
        path: "/moderator/reports/violations",
        icon: ClipboardList,
        tone: "text-violet-600",
        bg: "bg-violet-50",
    },
    {
        title: "Process Refund Requests",
        description: "Xem thong tin thanh toan va approve, process hoac reject yeu cau hoan tien.",
        path: "/moderator/transactions/refunds",
        icon: ReceiptText,
        tone: "text-indigo-600",
        bg: "bg-indigo-50",
    },
];
