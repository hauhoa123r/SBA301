import ActivitySection from "../components/ActivitySection";
import ProfileHero from "../components/ProfileHero";
import ProfileProgress from "../components/ProfileProgress";

const studentName = "Hậu Văn Hoà";

export default function LearningProfileView({ course, totalLessons, firstLesson }) {
    return (
        <section id="profile" className="scroll-mt-24 space-y-5">
            <div>
                <h2 className="text-xl font-black">Learning Profile</h2>
                <p className="mt-1 text-sm text-[#94a3b8]">Theo dõi tiến độ và sự cải thiện sau mỗi buổi học.</p>
            </div>

            <div className="rounded-2xl border border-[#7c3aed]/20 bg-[#120922] p-5 shadow-xl shadow-black/10">
                <ProfileHero studentName={studentName} />
                <ProfileProgress course={course} firstLesson={firstLesson} totalLessons={totalLessons} />
                <ActivitySection />
            </div>
        </section>
    );
}
