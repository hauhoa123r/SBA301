import {
    CheckCircle2,
    ClipboardList,
    Eye,
    EyeOff,
    ReceiptText,
    XCircle,
} from "lucide-react";

export const MODERATOR_FEATURES = [
    {
        title: "Review Courses",
        description: "Kiem tra noi dung, metadata, gia va ghi chu cua khoa hoc dang cho duyet.",
        path: "/moderator/courses/review",
        icon: Eye,
        tone: "text-sky-600",
        bg: "bg-sky-50",
    },
    {
        title: "Approve Courses",
        description: "Duyet cac khoa hoc dat chat luong de hien thi cho hoc vien.",
        path: "/moderator/courses/approve",
        icon: CheckCircle2,
        tone: "text-emerald-600",
        bg: "bg-emerald-50",
    },
    {
        title: "Reject Courses",
        description: "Tu choi khoa hoc va de lai ly do ro rang cho instructor chinh sua.",
        path: "/moderator/courses/reject",
        icon: XCircle,
        tone: "text-rose-600",
        bg: "bg-rose-50",
    },
    {
        title: "Hide Courses",
        description: "An khoa hoc da public khi co van de ve chat luong, ban quyen hoac chinh sach.",
        path: "/moderator/courses/hide",
        icon: EyeOff,
        tone: "text-amber-600",
        bg: "bg-amber-50",
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
