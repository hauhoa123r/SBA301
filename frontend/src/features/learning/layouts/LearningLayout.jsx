import { Outlet, useLocation } from "react-router-dom";
import StartLearningHeader from "../components/start-learning/StartLearningHeader";
import StartLearningSidebar from "../components/start-learning/StartLearningSidebar";

export default function LearningLayout() {
    const { hash } = useLocation();
    const activeView = hash.replace("#", "") || "overview";

    return (
        <div className="min-h-screen bg-brand-darker text-brand-white" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>
            <StartLearningHeader />

            <div className="group/page grid transition-[grid-template-columns] duration-300 ease-out lg:grid-cols-[80px_1fr] lg:has-[.learning-start-sidebar:hover]:grid-cols-[260px_1fr]">
                <StartLearningSidebar activeView={activeView} />

                <main className="start-learning-surface min-w-0 px-4 py-6 md:px-7 xl:px-9">
                    <Outlet context={{ activeView }} />
                </main>
            </div>
        </div>
    );
}
