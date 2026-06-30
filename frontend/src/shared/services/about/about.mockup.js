import { Award, BookOpenText, GraduationCap, Mic, Users, BarChart2 } from "lucide-react";

export const ABOUT_HIGHLIGHTS = [
    { icon: Users, value: "12K+", label: "Chinese learners" },
    { icon: BookOpenText, value: "6", label: "HSK learning paths" },
    { icon: GraduationCap, value: "80+", label: "Guided lessons" },
    { icon: Award, value: "98%", label: "Learner satisfaction" },
];

export const ABOUT_VALUES = [
    {
        icon: BookOpenText,
        title: "Structured HSK roadmap",
        description: "Lessons are organized by level so learners can build vocabulary, grammar, reading, and listening skills step by step.",
    },
    {
        icon: Mic,
        title: "Pronunciation that sticks",
        description: "Pinyin, tones, and speaking drills help students sound clearer and feel more confident in real conversations.",
    },
    {
        icon: BarChart2,
        title: "Progress you can measure",
        description: "Quizzes, practice results, and learning milestones make it easier to see what to review before moving forward.",
    },
];
