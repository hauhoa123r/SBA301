import api from "../../../../api/axios";
import { API_COURSES } from "../../../../api/apiPath";

const normalizeCourse = (course) => ({
  ...course,
  teacher_id: course.teacherId,
  category_id: course.categoryId,
  thumbnail_url: course.thumbnailUrl,
  created_at: course.createdAt?.slice(0, 10),
  updated_at: course.updatedAt?.slice(0, 10),
  image: course.thumbnailUrl,
  category: course.category ?? "Uncategorized",
  instructor: course.instructor ?? "Updating",
  price: Number(course.price ?? 0),
  rating: course.rating ?? 0,
  students: course.students ?? 0,
  duration: course.duration ?? "Đang cập nhật",
  level: course.level ?? "Tất cả trình độ",
  badge: course.badge ?? course.status,
  chapters: course.chapters ?? [],
  totalLessons: course.totalLessons ?? 0,
});

export const getCourses = async () => {
  console.log(api.getUri);
  console.log(API_COURSES);
  const response = await api.get(API_COURSES);
  return response.data.map(normalizeCourse);
};

export const getCourseById = async (id) => {
  const response = await api.get(`${API_COURSES}/${id}`);
  return normalizeCourse(response.data);
};
