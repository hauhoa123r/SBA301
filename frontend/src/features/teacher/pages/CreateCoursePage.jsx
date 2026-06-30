import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseForm from '../components/CourseForm';
import { createCourse } from '../service/teacherService';

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      await createCourse(formData);
      navigate('/teacher/courses', {
        state: { message: 'Khóa học được tạo thành công!' },
      });
    } catch (err) {
      setError(err.message || 'Lỗi khi tạo khóa học');
      setLoading(false);
    }
  };

  return <CourseForm initialData={null} onSubmit={handleSubmit} loading={loading} error={error} />;
}
