import { UserRound } from "lucide-react";
import { UserReveal } from "@/shared/ui";

export default function LearningGreeting({ studentName }) {
    return (
        <UserReveal as="section" className="border-b border-brand-accent/15 pb-5" distance={18}>
            <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-accent text-brand-white">
                    <UserRound className="h-8 w-8" />
                </div>
                <div className="min-w-0">
                    <h1 className="truncate text-2xl font-black md:text-3xl">Xin chào, {studentName}</h1>
                    <p className="mt-1 text-sm text-brand-textSecondary">Cùng Edujar tiến bộ mỗi ngày nào!</p>
                </div>
            </div>
        </UserReveal>
    );
}
