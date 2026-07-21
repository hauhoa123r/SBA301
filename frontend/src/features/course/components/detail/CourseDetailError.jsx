export default function CourseDetailError({ message }) {
    return (
        <section role="alert" className="user-ui-scope container mx-auto px-4 py-16 text-center text-brand-danger sm:px-6">
            {message || "Không thể tải thông tin khóa học."}
        </section>
    );
}
