import { Mail, MapPin, Phone } from "lucide-react";

export const CONTACT_METHODS = [
    {
        icon: Mail,
        title: "Email",
        value: "support@edujar.vn",
        description: "For course access, HSK study plans, pronunciation practice, and payment support.",
    },
    {
        icon: Phone,
        title: "Phone",
        value: "+84 28 1234 5678",
        description: "Available Monday to Friday, 8:30 - 17:30.",
    },
    {
        icon: MapPin,
        title: "Office",
        value: "Ho Chi Minh City, Vietnam",
        description: "Built for Vietnamese learners studying Chinese with confidence.",
    },
];

export const CONTACT_TOPICS = [
    "Course support",
    "HSK learning path",
    "Pronunciation practice",
    "Subscription and payment",
    "Technical issue",
];
