import {
    Users,
    Award,
    BarChart2,
    Globe,
    BookOpenText,
    Mic,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface HomeFeature {
    readonly icon: LucideIcon;
    readonly title: string;
    readonly desc: string;
}

interface Testimonial {
    readonly name: string;
    readonly role: string;
    readonly avatar: string;
    readonly text: string;
    readonly stars: number;
    readonly course: string;
}

export const HOME_HERO = {
    badge: "#1 Nền tảng học tiếng Trung cho người Việt",
    titlePrefix: "Chinh phục tiếng Trung",
    titleHighlight: "tự tin",
    titleSuffix: "từ Pinyin đến HSK",
    description: "Xây dựng vốn từ, phát âm, ngữ pháp và kỹ năng giao tiếp tiếng Trung qua lộ trình bài học dành riêng cho người Việt.",
    primaryCta: "Khám phá khóa học tiếng Trung",
    secondaryCta: "Xem demo",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&h=480&fit=crop&auto=format",
    imageAlt: "Học viên cùng học tiếng Trung trên Edujar",
    leftStat: {
        value: "80+ bài học",
        label: "Luyện tập theo HSK",
    },
    rightStat: {
        value: "4,9 / 5 sao",
        label: "Từ học viên tiếng Trung",
    },
};

export const STATS = [
    {
        value: "12K+",
        label: "Học viên tiếng Trung",
    },
    {
        value: "80+",
        label: "Bài học có hướng dẫn",
    },
    {
        value: "98%",
        label: "Mức độ hài lòng",
    },
    {
        value: "6",
        label: "Lộ trình HSK",
    },
];

export const FEATURES = [
    {
        icon: BookOpenText,
        title: "Bài học bám sát HSK",
        desc: "Học từ vựng, ngữ pháp và kỹ năng đọc theo từng cấp độ HSK rõ ràng.",
    },
    {
        icon: Award,
        title: "Luyện thi sẵn sàng",
        desc: "Rèn luyện với quiz và đề mô phỏng sát cấu trúc bài thi tiếng Trung.",
    },
    {
        icon: Mic,
        title: "Hướng dẫn phát âm",
        desc: "Cải thiện thanh điệu, pinyin và sự tự tin khi nói qua bài luyện có hướng dẫn.",
    },
    {
        icon: Globe,
        title: "Giải thích bằng tiếng Việt",
        desc: "Học tiếng Trung qua ví dụ thực tế và phần giải thích dễ hiểu bằng tiếng Việt.",
    },
    {
        icon: BarChart2,
        title: "Theo dõi tiến độ",
        desc: "Nắm rõ vốn từ, mức hoàn thành bài học và độ sẵn sàng cho kỳ thi theo thời gian.",
    },
    {
        icon: Users,
        title: "Giao tiếp thực tế",
        desc: "Luyện tiếng Trung dùng hằng ngày cho du lịch, học tập, công việc và giao tiếp.",
    },
] satisfies readonly HomeFeature[];

export const TESTIMONIALS = [
    {
        name: "Trần Minh Anh",
        role: "Học viên HSK 3",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format",
        text: "Các bài học pinyin và thanh điệu giúp mình hiểu cách phát âm rõ ràng hơn. Sau 3 tháng, mình đã tự tin giao tiếp những câu cơ bản.",
        stars: 5,
        course: "Nền tảng tiếng Trung",
    },
    {
        name: "Lê Hoàng Nam",
        role: "Học viên HSK 4",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format",
        text: "Phần giải thích bằng tiếng Việt giúp mình hiểu mẫu ngữ pháp nhanh hơn nhiều. Các đề mô phỏng cũng rất sát với bài luyện HSK.",
        stars: 5,
        course: "HSK 4 tăng tốc",
    },
    {
        name: "Phạm Ngọc Linh",
        role: "Học viên tiếng Trung công việc",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format",
        text: "Mình cần tiếng Trung cho công việc và các bài hội thoại rất thực tế ngay từ buổi đầu. Giờ mình giới thiệu sản phẩm và phản hồi khách hàng tự nhiên hơn.",
        stars: 5,
        course: "Tiếng Trung nơi làm việc",
    },
] satisfies readonly Testimonial[];
