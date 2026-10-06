import { useEffect, useState } from "react";
import { getCourseLearningDetails, getCourseProgress } from "../api/learning-api";
import { getLearningStats } from "../api/learning-profile-api";

export default function useLearningDashboard({
    selectedCourseId,
    setSelectedCourseId,
    setEnrolledCourses,
}) {
    const [stats, setStats] = useState(null);
    const [course, setCourse] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        // Keep the existing loading transition while the selected course changes.
        setLoading(true);
        setError("");

        const loadLearningData = async () => {
            try {
                const data = await getLearningStats(selectedCourseId);
                if (!active) return;

                const enrolledCourses = Array.isArray(data.enrolledCourses) ? data.enrolledCourses : [];
                const selectedIsOwned = enrolledCourses.some(
                    (item) => String(item.id) === String(selectedCourseId),
                );
                const targetCourseId = selectedIsOwned
                    ? selectedCourseId
                    : data.courseId || enrolledCourses[0]?.id || null;

                setStats({ ...data, enrolledCourses });
                setEnrolledCourses(enrolledCourses);

                if (!targetCourseId) {
                    setSelectedCourseId(null);
                    setCourse(null);
                    return;
                }

                if (String(targetCourseId) !== String(selectedCourseId)) {
                    setSelectedCourseId(targetCourseId);
                }

                const [courseDetails, progress] = await Promise.all([
                    getCourseLearningDetails(targetCourseId), getCourseProgress(targetCourseId),
                ]);
                if (active) {
                    setCourse({ ...courseDetails, progress });
                    setStats(previous => ({ ...previous, completedActivities: progress.completedActivities, totalActivities: progress.totalActivities }));
                }
            } catch (requestError) {
                console.error("Error fetching owned learning courses", requestError);
                if (active) {
                    setCourse(null);
                    setError(
                        requestError.response?.data?.message
                        || "Không thể tải các khóa học bạn đang sở hữu.",
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadLearningData();
        return () => {
            active = false;
        };
    }, [selectedCourseId, setSelectedCourseId, setEnrolledCourses]);

    return { course, error, loading, stats };
}
