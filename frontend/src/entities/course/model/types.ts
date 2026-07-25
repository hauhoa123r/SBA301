export interface Lesson {
  id?: number;
  title?: string;
  videoUrl?: string;
  durationSeconds?: number;
  duration?: string;
  orderIndex?: number;
  order_index?: number;
}

export interface Chapter {
  id?: number;
  title?: string;
  orderIndex?: number;
  order_index?: number;
  lessons?: Lesson[];
}

export interface CourseCatalogItem {
  id?: number;
  instructor?: string;
  category?: string;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  price: number;
  totalLessons?: number;
  durationText?: string;
  rating?: number;
  status?: string;
}

export interface CourseDetail extends CourseCatalogItem {
  teacherId?: number;
  categoryId?: number;
  students?: number;
  totalDurationSeconds?: number;
  duration?: string;
  level?: string;
  chapters?: Chapter[];
  createdAt?: string;
  updatedAt?: string;
}

