import { Mail, MapPin, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ContactMethod {
    readonly icon: LucideIcon;
    readonly title: string;
    readonly value: string;
    readonly description: string;
}

export const CONTACT_METHODS = [
    {
        icon: Mail,
        title: "Email",
        value: "support@edujar.vn",
        description: "Hỗ trợ truy cập khóa học, lộ trình HSK, luyện phát âm và thanh toán.",
    },
    {
        icon: Phone,
        title: "Điện thoại",
        value: "+84 28 1234 5678",
        description: "Hoạt động từ thứ Hai đến thứ Sáu, 8:30 - 17:30.",
    },
    {
        icon: MapPin,
        title: "Văn phòng",
        value: "Hòa Lạc, Hà Nội",
        description: "Được xây dựng cho người Việt học tiếng Trung tự tin hơn mỗi ngày.",
    },
] satisfies readonly ContactMethod[];

export const CONTACT_TOPICS = [
    "Hỗ trợ khóa học",
    "Lộ trình học HSK",
    "Luyện phát âm",
    "Gói đăng ký và thanh toán",
    "Sự cố kỹ thuật",
];
