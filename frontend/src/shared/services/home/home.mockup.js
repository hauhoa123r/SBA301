import {
    Users,
    Award,
    BarChart2,
    Globe,
    BookOpenText,
    Mic,
} from "lucide-react";

export const HOME_HERO = {
    badge: "#1 Chinese Learning Platform for Vietnamese Learners",
    titlePrefix: "Master Chinese",
    titleHighlight: "with Confidence",
    titleSuffix: "from Pinyin to HSK",
    description: "Build Mandarin vocabulary, pronunciation, grammar, and conversation skills through guided lessons designed for Vietnamese learners.",
    primaryCta: "Explore Chinese Courses",
    secondaryCta: "Watch Demo",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&h=480&fit=crop&auto=format",
    imageAlt: "Students learning Chinese together on Edujar",
    leftStat: {
        value: "80+ Lessons",
        label: "HSK-focused practice",
    },
    rightStat: {
        value: "4.9 / 5 Stars",
        label: "From Chinese learners",
    },
};

export const STATS = [
    {
        value: "12K+",
        label: "Chinese Learners",
    },
    {
        value: "80+",
        label: "Guided Lessons",
    },
    {
        value: "98%",
        label: "Satisfaction Rate",
    },
    {
        value: "6",
        label: "HSK Paths",
    },
];

export const FEATURES = [
    {
        icon: BookOpenText,
        title: "HSK-Focused Lessons",
        desc: "Study vocabulary, grammar, and reading skills by clear HSK levels.",
    },
    {
        icon: Award,
        title: "Exam-Ready Practice",
        desc: "Train with quizzes and mock tests that match real Chinese exam formats.",
    },
    {
        icon: Mic,
        title: "Pronunciation Coaching",
        desc: "Improve tones, pinyin, and speaking confidence with guided practice.",
    },
    {
        icon: Globe,
        title: "Vietnamese Explanations",
        desc: "Learn Chinese through practical Vietnamese explanations and examples.",
    },
    {
        icon: BarChart2,
        title: "Progress Tracking",
        desc: "Follow your vocabulary, lesson completion, and test readiness over time.",
    },
    {
        icon: Users,
        title: "Real Conversation Skills",
        desc: "Practice everyday Chinese for travel, study, work, and daily communication.",
    },
];

export const TESTIMONIALS = [
    {
        name: "Minh Anh Tran",
        role: "HSK 3 learner",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format",
        text: "The pinyin and tone lessons finally made Chinese pronunciation feel clear. After 3 months, I could hold basic conversations with confidence.",
        stars: 5,
        course: "Chinese Foundations",
    },
    {
        name: "Hoang Nam Le",
        role: "HSK 4 student",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format",
        text: "The Vietnamese explanations helped me understand grammar patterns much faster. The mock tests were very close to what I saw in HSK practice.",
        stars: 5,
        course: "HSK 4 Intensive",
    },
    {
        name: "Ngoc Linh Pham",
        role: "Business Chinese learner",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format",
        text: "I needed Chinese for work, and the conversation lessons were practical from day one. I can now introduce products and reply to clients more naturally.",
        stars: 5,
        course: "Workplace Chinese",
    },
];
