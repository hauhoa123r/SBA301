import { Award, BookOpenText, GraduationCap, Mic, Users, BarChart2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface AboutHighlight {
    readonly icon: LucideIcon;
    readonly value: string;
    readonly label: string;
}

interface AboutValue {
    readonly icon: LucideIcon;
    readonly title: string;
    readonly description: string;
}

export const ABOUT_HIGHLIGHTS = [
    { icon: Users, value: "12K+", label: "Học viên tiếng Trung" },
    { icon: BookOpenText, value: "6", label: "Lộ trình học HSK" },
    { icon: GraduationCap, value: "80+", label: "Bài học có hướng dẫn" },
    { icon: Award, value: "98%", label: "Mức độ hài lòng" },
] satisfies readonly AboutHighlight[];

export const ABOUT_VALUES = [
    {
        icon: BookOpenText,
        title: "Lộ trình HSK có cấu trúc",
        description: "Bài học được sắp xếp theo từng cấp độ để học viên xây dựng từ vựng, ngữ pháp, kỹ năng đọc và nghe từng bước.",
    },
    {
        icon: Mic,
        title: "Phát âm dễ nhớ",
        description: "Pinyin, thanh điệu và bài luyện nói giúp học viên phát âm rõ hơn và tự tin hơn trong hội thoại thực tế.",
    },
    {
        icon: BarChart2,
        title: "Tiến độ đo lường được",
        description: "Quiz, kết quả luyện tập và các mốc học tập giúp bạn biết cần ôn lại phần nào trước khi học tiếp.",
    },
] satisfies readonly AboutValue[];
