import { useEffect, useState } from "react";
import { getCourseById } from "../services/api/courseService";

const COURSE_LOAD_ERROR_MESSAGE = "Không thể tải thông tin khóa học. Vui lòng thử lại sau.";

const initialState = {
    course: null,
    isLoading: true,
    isNotFound: false,
    isError: false,
    errorMessage: "",
};

export default function useCourseDetail(courseId) {
    const [state, setState] = useState(initialState);

    useEffect(() => {
        let isMounted = true;

        const fetchCourse = async () => {
            setState({
                course: null,
                isLoading: true,
                isNotFound: false,
                isError: false,
                errorMessage: "",
            });

            try {
                const course = await getCourseById(courseId);
                if (!isMounted) return;

                setState({
                    course,
                    isLoading: false,
                    isNotFound: false,
                    isError: false,
                    errorMessage: "",
                });
            } catch (error) {
                if (!isMounted) return;

                const isNotFound = error?.response?.status === 404;
                setState({
                    course: null,
                    isLoading: false,
                    isNotFound,
                    isError: !isNotFound,
                    errorMessage: isNotFound ? "" : COURSE_LOAD_ERROR_MESSAGE,
                });
            }
        };

        fetchCourse();

        return () => {
            isMounted = false;
        };
    }, [courseId]);

    return state;
}
