import ActivitySection from "../components/learning-profile/ActivitySection";
import ProfileHero from "../components/learning-profile/ProfileHero";
import ProfileProgress from "../components/learning-profile/ProfileProgress";

const studentName = "Hậu Văn Hoà";

export default function LearningProfileView({ course, totalLessons, firstLesson }) {
    return (
        <section id="profile" className="scroll-mt-24 space-y-5">
            <div>
                <h2 className="text-xl font-black">Learning Profile</h2>
                <p className="mt-1 text-sm text-brand-textSecondary">Theo dõi tiến độ và sự cải thiện sau mỗi buổi học.</p>
            </div>

            <div className="rounded-2xl border border-brand-accent/20 bg-brand-panel p-5 shadow-xl shadow-brand-black/10">
                <ProfileHero studentName={studentName} />
                <ProfileProgress course={course} firstLesson={firstLesson} totalLessons={totalLessons} />
                <ActivitySection />
            </div>
        </section>
    );
}
