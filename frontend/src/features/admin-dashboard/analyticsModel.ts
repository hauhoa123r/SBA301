export interface DateFilter { from: string; to: string; mode: string; includeLab: boolean }
export function defaultDates(): DateFilter {
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
  const start = new Date(`${today}T00:00:00Z`); start.setUTCDate(start.getUTCDate() - 29);
  return { from: start.toISOString().slice(0, 10), to: today, mode: "day", includeLab: false };
}
export interface RegistrationReport {
  total: number; previousTotal: number; changePercent: number | null; activeStudents: number; totalUsers: number;
  buckets: { label: string; count: number }[]; hourlySignals: { hour: string; count: number }[]; notes: string[];
}
export interface LearningReport {
  summary: { totalEnrollments: number; uniqueEnrolledStudents: number; studentsStarted: number; studentsCompletedLesson: number; courseCompletions: number };
  courses: { id: number; title: string; enrolled: number; uniqueStudents: number; started: number; completedLessonUsers: number; courseCompletionCount: number; startRate: number | null }[];
  enrollmentTrend: { date: string; enrollments: number }[];
}
export interface PaymentTransaction {
  id: number; transactionId: string; invoiceId: number; studentId: number; student: string; email: string; product: string; productType: string;
  amount: number; method: string; status: string; paymentTime: string | null; createdAt: string | null; refundedAmount: number; invoiceAmount: number; invoiceStatus: string;
}
export interface PaymentReport {
  totalRevenue: number; revenueThisMonth: number; revenue: number; refundedAmount: number; netRevenue: number | null;
  successfulPayments: number; pendingPayments: number; failedPayments: number; totalTransactions: number; unknownPaymentTimes: number;
  trend: { label: string; amount: number }[]; statuses: { status: string; count: number }[];
  products: { type: string; courseId: number | null; name: string; revenue: number }[];
  content: PaymentTransaction[]; totalElements: number; totalPages: number; page: number; notes: string[];
}
export const paymentLabels: Record<string, string> = { CREATED: "Đang chờ", SUCCESS: "Thành công", FAILED: "Thất bại", CANCELLED: "Đã hủy", EXPIRED: "Hết hạn" };
export function downloadRegistrationCsv(rows: { label: string; count: number }[]) {
  const csv = "\uFEFFKhoảng,Số đăng ký\r\n" + rows.map(r => `"${r.label.replaceAll('"', '""')}",${r.count}`).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a"); a.href = url; a.download = "edujar-registrations.csv"; a.click(); URL.revokeObjectURL(url);
}
