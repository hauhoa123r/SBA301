export interface LessonResponse {
    id?: number;
    title?: string;
    videoUrl?: string;
    durationSeconds?: number;
    duration?: string;
    orderIndex?: number;
}

export interface ChapterResponse {
    id?: number;
    title?: string;
    orderIndex?: number;
    lessons?: LessonResponse[];
}

export interface CourseDetailResponse {
    id?: number;
    teacherId?: number;
    instructor?: string;
    categoryId?: number;
    category?: string;
    title?: string;
    description?: string;
    thumbnailUrl?: string;
    status?: string;
    price?: number;
    students?: number;
    totalLessons?: number;
    totalDurationSeconds?: number;
    duration?: string;
    durationText?: string;
    rating?: number;
    level?: string;
    chapters?: ChapterResponse[];
    createdAt?: string;
    updatedAt?: string;
}
