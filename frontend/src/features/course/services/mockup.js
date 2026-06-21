import {
    Users,
    Award,
    BarChart2,
    Globe,
    Zap,
    Shield,
} from "lucide-react";


export const NAV_LINKS = [{
        label: "Home",
        path: "/",
    },
    {
        label: "About",
        path: "/about",
    },
    {
        label: "Courses",
        path: "/courses",
    },
    {
        label: "Blog",
        path: "/blog",
    },
    {
        label: "Contact",
        path: "/contact",
    },
];
export const STATS = [{
        value: "120K+",
        label: "Active Learners"
    },
    {
        value: "1,800+",
        label: "Expert Courses"
    },
    {
        value: "98%",
        label: "Satisfaction Rate"
    },
    {
        value: "340+",
        label: "Top Instructors"
    },
];

export const COURSES = [{
        id: 1,
        category: "Development",
        title: "Full-Stack Web Dev with React & Node.js",
        instructor: "Minh Tran",
        rating: 4.9,
        students: 14200,
        duration: "48h 30m",
        level: "Intermediate",
        price: 1_290_000,
        image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=480&h=300&fit=crop&auto=format",
        badge: "Bestseller",
    },
    {
        id: 2,
        category: "Design",
        title: "UI/UX Design Mastery: From Figma to Prototype",
        instructor: "Linh Nguyen",
        rating: 4.8,
        students: 9800,
        duration: "32h 15m",
        level: "All Levels",
        price: 990_000,
        image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=480&h=300&fit=crop&auto=format",
        badge: "Hot",
    },
    {
        id: 3,
        category: "Data Science",
        title: "Machine Learning & AI for Practitioners",
        instructor: "Duc Le",
        rating: 4.9,
        students: 7400,
        duration: "56h 0m",
        level: "Advanced",
        price: 1_590_000,
        image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=480&h=300&fit=crop&auto=format",
        badge: "New",
    },
    {
        id: 4,
        category: "Business",
        title: "Digital Marketing & Growth Hacking",
        instructor: "Thu Pham",
        rating: 4.7,
        students: 11500,
        duration: "24h 45m",
        level: "Beginner",
        price: 790_000,
        image: "https://images.unsplash.com/photo-1432888622747-4eb9a8f5a07d?w=480&h=300&fit=crop&auto=format",
        badge: "Bestseller",
    },
    {
        id: 5,
        category: "Development",
        title: "Mobile App Development with Flutter",
        instructor: "Nam Vo",
        rating: 4.8,
        students: 6100,
        duration: "38h 20m",
        level: "Intermediate",
        price: 1_190_000,
        image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=480&h=300&fit=crop&auto=format",
        badge: null,
    },
    {
        id: 6,
        category: "Cybersecurity",
        title: "Ethical Hacking & Penetration Testing",
        instructor: "Hung Bui",
        rating: 4.9,
        students: 8300,
        duration: "44h 10m",
        level: "Advanced",
        price: 1_490_000,
        image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=480&h=300&fit=crop&auto=format",
        badge: "Hot",
    },
];

export const FEATURES = [{
        icon: Zap,
        title: "Learn at Your Own Pace",
        desc: "Access courses anytime, anywhere.",
    },
    {
        icon: Award,
        title: "Industry-Recognized Certificates",
        desc: "Earn certificates trusted by top companies.",
    },
    {
        icon: Users,
        title: "Expert Instructors",
        desc: "Learn from practitioners.",
    },
    {
        icon: Globe,
        title: "Multilingual Content",
        desc: "Courses in Vietnamese and English.",
    },
    {
        icon: BarChart2,
        title: "Progress Analytics",
        desc: "Track your learning journey.",
    },
    {
        icon: Shield,
        title: "30-Day Money Back",
        desc: "Full refund within 30 days.",
    },
];

export const TESTIMONIALS = [{
        name: "Anh Khoa Pham",
        role: "Front-end Dev at Tiki",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format",
        text: "Edujar completely changed my career trajectory. The React & Node course gave me the exact skills I needed to land my first dev job at Tiki within 4 months.",
        stars: 5,
        course: "Full-Stack Web Dev",
    },
    {
        name: "Bich Ngoc Tran",
        role: "UX Designer at VNG",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format",
        text: "The UI/UX course quality is on par with Coursera — but explained in Vietnamese context. I got promoted 3 months after finishing it.",
        stars: 5,
        course: "UI/UX Design Mastery",
    },
    {
        name: "Thanh Long Nguyen",
        role: "Data Analyst at Momo",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format",
        text: "The ML course is incredibly hands-on. Real datasets, real projects. My instructor responded to my question within 2 hours.",
        stars: 5,
        course: "Machine Learning & AI",
    },
];

export const CATEGORIES = [
    "Development", "Design", "Data Science", "Business", "Cybersecurity", "Marketing",
];

export const BADGE_COLORS = {
    Bestseller: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Hot: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    New: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};