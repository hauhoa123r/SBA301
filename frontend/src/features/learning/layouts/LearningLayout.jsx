import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import StartLearningHeader from "../components/start-learning/StartLearningHeader";
import StartLearningSidebar from "../components/start-learning/StartLearningSidebar";

export default function LearningLayout() {
    const { hash } = useLocation();
    const activeView = hash.replace("#", "") || "overview";

    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!sidebarOpen) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === "Escape") setSidebarOpen(false);
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [sidebarOpen]);

    return (
        <div className="user-ui-scope min-h-screen bg-brand-darker text-brand-white" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>
            <StartLearningHeader 
                selectedCourseId={selectedCourseId}
                setSelectedCourseId={setSelectedCourseId}
                enrolledCourses={enrolledCourses}
                sidebarOpen={sidebarOpen}
                onSidebarToggle={() => setSidebarOpen((current) => !current)}
            />

            <div className="group/page grid transition-[grid-template-columns] duration-300 ease-out lg:grid-cols-[80px_1fr] lg:has-[.learning-start-sidebar:hover]:grid-cols-[260px_1fr]">
                <StartLearningSidebar
                    activeView={activeView}
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                <main className="start-learning-surface min-w-0 px-4 py-6 md:px-7 xl:px-9">
                    <Outlet context={{ activeView, selectedCourseId, setSelectedCourseId, setEnrolledCourses }} />
                </main>
            </div>
        </div>
    );
}
