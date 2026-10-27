import { BookOpen, CreditCard, Lightbulb, MoreHorizontal, Wrench } from "lucide-react";

export const contactCategories = [
  { category: "COURSE_SUPPORT", label: "Hỗ trợ khóa học", icon: BookOpen, tone: "blue" },
  { category: "SUBSCRIPTION", label: "Gói đăng ký và thanh toán", icon: CreditCard, tone: "violet" },
  { category: "TECHNICAL", label: "Sự cố kỹ thuật", icon: Wrench, tone: "amber" },
  { category: "WEBSITE", label: "Góp ý về website", icon: Lightbulb, tone: "green" },
  { category: "OTHER", label: "Khác", icon: MoreHorizontal, tone: "slate" },
] as const;
export type ContactCategory = typeof contactCategories[number]["category"];
export type ContactStatus = "NEW" | "RESOLVED";
export interface ContactMessage { id: number; fullName: string; email: string; topic: string; message: string; status: ContactStatus; createdAt: string; registeredSender?: boolean; reply?: string | null; repliedAt?: string | null }
export interface ContactInboxData { content: ContactMessage[]; totalElements: number; totalPages: number; page: number; unreadCount: number }
export interface CategoryCount { category: ContactCategory; label: string; total: number; unread: number; resolved: number }
export interface ContactStatistics { totalReceived: number; unreadCount: number; resolvedCount: number; categories: CategoryCount[] }
export const contactApi = "/api/admin/contact-messages";
export function categoryOf(topic: string) { return contactCategories.find(c => c.label === topic) ?? contactCategories[4]; }
export function validCategory(value: string | null): ContactCategory | "" {
  return contactCategories.find(c => c.category === value)?.category ?? "";
}
export function feedbackNumber(value: number | undefined) { return value === undefined ? "—" : value.toLocaleString("vi-VN"); }
