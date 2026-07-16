import api from "../../../../api/axios";
import { API_COUPON, API_COURSES } from "../../../../api/apiPath";
import type { CourseCatalogResponse } from "../../dto/response/CourseCatalogResponse";
import type { CourseDetailResponse } from "../../dto/response/CourseDetailResponse";

export const getCourses = async (): Promise<CourseCatalogResponse[]> => {
  const response = await api.get<CourseCatalogResponse[]>(API_COURSES);

  if (!Array.isArray(response.data)) {
    throw new TypeError("Invalid course catalog response: expected an array");
  }

  return response.data;
};

export const getCourseById = async (id: number | string | undefined): Promise<CourseDetailResponse> => {
  const response = await api.get<CourseDetailResponse>(`${API_COURSES}/${id}`);
  return response.data;
};

export const isExistVourcher = async (voucherCode: string): Promise<boolean> => {
  const response = await api.get<{ status: string }>(`${API_COUPON}/${encodeURIComponent(voucherCode.trim())}`);
  return response.data.status === "VALID";
}
