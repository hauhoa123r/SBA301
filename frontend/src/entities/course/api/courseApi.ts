import { API_COURSES, axiosClient } from "@/shared/api";

import type { CourseCatalogItem, CourseDetail } from "../model/types";

export async function getCourses(): Promise<CourseCatalogItem[]> {
  const response = await axiosClient.get<CourseCatalogItem[]>(API_COURSES);

  if (!Array.isArray(response.data)) {
    throw new TypeError("Invalid course catalog response: expected an array");
  }

  return response.data;
}

export async function getCourseById(
  id: number | string | undefined,
): Promise<CourseDetail> {
  const response = await axiosClient.get<CourseDetail>(`${API_COURSES}/${id}`);
  return response.data;
}

