import ActivitySection from "../components/learning-profile/ActivitySection";
import ProfileHero from "../components/learning-profile/ProfileHero";
import ProfileProgress from "../components/learning-profile/ProfileProgress";

export default function LearningProfileView({ course, stats }) {
    return <section id="profile" className="scroll-mt-24 space-y-5">
        <h2 className="text-xl font-black">Hồ sơ học tập</h2>
        <div className="rounded-2xl border border-brand-accent/20 bg-brand-panel p-5">
            <ProfileHero studentName={stats?.studentName || "bạn"} />
            <ProfileProgress course={course} />
            <ActivitySection />
        </div>
    </section>;
}
