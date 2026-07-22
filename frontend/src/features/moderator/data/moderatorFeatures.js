import {
    ClipboardList,
    Eye,
    ReceiptText,
} from "lucide-react";

export const MODERATOR_FEATURES = [
    {
        title: "Quản lý khóa học",
        description: "Duyệt, phê duyệt, từ chối và ẩn khóa học trong một màn hình.",
        path: "/moderator/courses",
        icon: Eye,
        tone: "text-sky-600",
        bg: "bg-sky-50",
    },
    {
        title: "Quản lý báo cáo vi phạm",
        description: "Xử lý báo cáo vi phạm, xem bằng chứng, xử lý hoặc bỏ qua báo cáo không hợp lệ.",
        path: "/moderator/reports/violations",
        icon: ClipboardList,
        tone: "text-violet-600",
        bg: "bg-violet-50",
    },
    {
        title: "Xử lý yêu cầu hoàn tiền",
        description: "Xem thông tin thanh toán, duyệt, xử lý hoặc từ chối yêu cầu hoàn tiền.",
        path: "/moderator/transactions/refunds",
        icon: ReceiptText,
        tone: "text-indigo-600",
        bg: "bg-indigo-50",
    },
];
