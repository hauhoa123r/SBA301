export default function Loading() {
    return (
        <div className="flex justify-center items-center py-20 gap-3 text-gray-400">
            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            Đang tải dữ liệu...
        </div>
    );
}