import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseForm from '@/features/course/components/management/course-form/CourseForm';
import teacherService from '@/features/course/services/api/courseManagementService';

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      await teacherService.createCourse(formData);
      navigate('/management/courses', {
        state: { message: 'Tạo khóa học thành công!' },
      });
    } catch (err) {
      setError(err.message || 'Lỗi khi tạo khóa học');
      setLoading(false);
    }
  };

  return <CourseForm initialData={null} onSubmit={handleSubmit} loading={loading} error={error} />;
}
