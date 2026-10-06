import { useEffect, useState } from "react";
import { getLearningActivity } from "../api/learning-api";

export default function useActivityHeatmap() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    useEffect(() => {
        let active = true;
        getLearningActivity().then(value => { if (active) setData(value); })
            .catch(() => { if (active) setError("Không thể tải hoạt động học tập. Vui lòng tải lại trang."); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);
    return { data, loading, error };
}
