import { BookOpen, CircleDollarSign, Users } from "lucide-react";

import { UserReveal } from "@/shared/ui";

import type { CourseDetail } from "../model/types";

function toSafeStudentCount(value: unknown): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? Math.max(0, numberValue) : 0;
}

export interface CourseHeaderProps {
  course: CourseDetail;
}

export function CourseHeader({ course }: CourseHeaderProps) {
  const category = course.category || "Chưa phân loại";
  const title = course.title || "Khóa học";
  const description = course.description || "";
  const studentCount = toSafeStudentCount(course.students).toLocaleString("vi-VN");
  const instructorName = String(course.instructor || "").trim() || "Giảng viên";
  const instructorInitial = instructorName.charAt(0).toUpperCase();

  return (
    <>
      <UserReveal>
        <div className="mb-5 flex items-center gap-2 text-sm font-bold text-brand-textSecondary sm:mb-7">
          <BookOpen aria-hidden="true" className="h-4 w-4 text-brand-accentSoft" />
          <span>{category}</span>
        </div>

        <h1
          id="course-detail-title"
          className="max-w-5xl break-words text-3xl font-black leading-tight text-brand-white sm:text-4xl md:text-5xl lg:text-6xl"
        >
          {title}
        </h1>
        <p className="mt-5 max-w-5xl text-base leading-7 text-brand-textSecondary sm:mt-6 sm:leading-8 md:text-lg">
          {description}
        </p>
      </UserReveal>

      <UserReveal
        delay={80}
        className="mt-7 flex flex-wrap items-center gap-4 text-sm font-bold text-brand-textSecondary sm:gap-6 sm:text-base"
      >
        <span className="inline-flex items-center gap-2 rounded-xl border border-brand-accent/20 bg-brand-accent/10 px-4 py-2 text-brand-accentSoft">
          <CircleDollarSign aria-hidden="true" className="h-5 w-5" />
          Có trong mọi gói học
        </span>
        <span className="inline-flex items-center gap-2">
          <Users aria-hidden="true" className="h-5 w-5 text-brand-accentSoft" />
          {studentCount} học viên
        </span>
        <span className="inline-flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-accent text-sm font-black text-brand-white">
            {instructorInitial}
          </span>
          {instructorName}
        </span>
      </UserReveal>
    </>
  );
}

