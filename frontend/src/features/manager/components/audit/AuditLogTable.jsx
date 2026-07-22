function formatAction(log) {
    const action = log?.action;
    if (!action) return "--";

    const actionLabels = {
        CREATE_COURSE: "Tạo khóa học",
        UPDATE_COURSE: "Cập nhật khóa học",
        DELETE_COURSE: "Xóa khóa học",
        UPDATE_LESSON: "Cập nhật bài học",
        CREATE_LESSON: "Tạo bài học",
        DELETE_LESSON: "Xóa bài học",
        GRADE_ASSIGNMENT: "Chấm bài tập",
        RESOLVE_REPORT: "Xử lý báo cáo",
        PAYMENT_REFUND_REQUEST: "Yêu cầu hoàn tiền",
        ENROLL_COURSE: "Đăng ký khóa học",
        COMPLETE_LESSON: "Hoàn thành bài học",
        CREATE_QUIZ: "Tạo bài kiểm tra",
    };
    if (actionLabels[action]) {
        if (action === "CREATE_COURSE" && log.courseTitle) {
            return `${actionLabels[action]}: ${log.courseTitle}`;}
        if ((action === "CREATE_COUPON" || action === "UPDATE_COUPON" || action === "DELETE_COUPON") && log.couponCode) {
            return `${actionLabels[action]}: ${log.couponCode}`;}
        return actionLabels[action];}
    return action
        .toLowerCase()
        .split("_")
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(" ");}
function formatRole(roleName) {
    const roleLabels = {
        TEACHER: "Giảng viên",
        STUDENT: "Học viên",
        MODERATOR: "Điều phối viên",};
    return roleLabels[roleName]}

export default function AuditLogTable({ logs }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
                <thead>
                    <tr className="text-left text-sm text-gray-400 border-b border-gray-800">
                        <th className="pb-3 pr-4">Tên</th>
                        <th className="pb-3 pr-4">Vai trò</th>
                        <th className="pb-3 pr-4">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.length === 0 ? (
                        <tr>
                            <td colSpan="3" className="py-8 text-center text-gray-400">
                                Không có hoạt động nào phù hợp.
                            </td>
                        </tr>) : (
                        logs.map((log) => (
                            <tr key={log.id} className="border-b border-gray-800 last:border-b-0">
                                <td className="py-4 pr-4 font-medium text-white">{log.actorName || "--"}</td>
                                <td className="py-4 pr-4 text-gray-300">{formatRole(log.roleName)}</td>
                                <td className="py-4 pr-4 text-gray-300">{formatAction(log)}</td>
                            </tr>)))}
                </tbody>
            </table>
        </div>
    );
}
