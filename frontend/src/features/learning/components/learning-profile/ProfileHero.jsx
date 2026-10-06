import { UserRound } from "lucide-react";

export default function ProfileHero({ studentName }) {
    return <div className="flex items-center gap-4 rounded-2xl border border-brand-border bg-brand-light p-5">
        <UserRound className="h-10 w-10 text-brand-accentSoft" />
        <div>
            <p className="font-bold text-brand-accentSoft">Xin chào, {studentName}</p>
            <h3 className="mt-1 text-xl font-black">Hãy tiếp tục học mỗi ngày</h3>
            <p className="mt-2 text-sm text-brand-textSecondary">Theo dõi bài học, bài kiểm tra và bài tập đã hoàn thành.</p>
        </div>
    </div>;
}
