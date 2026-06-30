# Teacher Dashboard - Phân Hệ Quản Lý Giáo Viên

## 📋 Tổng Quan

Teacher Dashboard là phân hệ quản lý dành cho giáo viên trong nền tảng học tiếng Trung trực tuyến. Cung cấp các tính năng quản lý khóa học, theo dõi doanh thu, xem đánh giá học viên và quản lý giáo trình.

## 🏗️ Cấu Trúc Thư Mục

```
src/features/teacher/
├── components/                          # Các component dùng chung
│   ├── TeacherLayout.jsx               # Khung giao diện chính (Sidebar + Header)
│   ├── CoursesGrid.jsx                 # Component hiển thị grid khóa học
│   └── StatusBadge.jsx                 # Component Badge hiển thị trạng thái
├── pages/                               # Các trang chính
│   ├── TeacherDashboardPage.jsx        # Trang thống kê chung
│   ├── ManageCoursesPage.jsx           # Trang danh sách khóa học
│   ├── StudentReviewsPage.jsx          # Trang xem đánh giá học viên
│   ├── CreateCoursePage.jsx            # Trang tạo khóa học mới
│   ├── EditCoursePage.jsx              # Trang chỉnh sửa khóa học
│   └── CurriculumDesignPage.jsx        # Trang thiết kế giáo trình (Chương + Bài)
├── routes/
│   └── teacherRoutes.jsx               # Cấu hình định tuyến (Nested Routes)
├── service/
│   └── teacherService.js               # API calls dùng Axios
└── README.md                            # File hướng dẫn này
```

## 🎨 Theme Màu Sắc & Style

- **Nền chính:** `bg-gray-50` (Xám nhẹ)
- **Nền component:** `bg-white`
- **Màu chủ đạo (Primary):** `teal-600` (Xanh teal)
- **Màu hover:** `teal-700`
- **Border:** `border-gray-200`
- **Text chính:** `text-gray-900`
- **Text phụ:** `text-gray-600`

## 📦 Các Component Chính

### TeacherLayout.jsx
**Mục đích:** Khung giao diện tổng thể

**Tính năng:**
- Sidebar cố định trên desktop, responsive trên mobile
- Menu điều hướng: Thống kê, Khóa Học, Đánh Giá
- Header với thanh tìm kiếm, thông báo, và avatar
- Sử dụng `<Outlet />` để render nội dung trang con

**Props:** Không có (sử dụng context từ `AuthProvider`)

### CoursesGrid.jsx
**Mục đục:** Hiển thị danh sách khóa học dạng Grid

**Tính năng:**
- Hiển thị thumbnail, tiêu đề, mô tả
- Badge trạng thái (Xuất Bản, Bản Nháp, Chờ Duyệt, Ẩn)
- Nút hành động: Sửa, Thiết kế Giáo Trình
- Responsive: 1 cột mobile, 2-3 cột desktop

**Props:**
- `courses` (Array) - Danh sách khóa học
- `onEditCourse` (Function) - Callback khi nhấn nút Sửa
- `onDesignCurriculum` (Function) - Callback khi nhấn nút Thiết kế

### StatusBadge.jsx
**Mục đích:** Hiển thị badge trạng thái

**Trạng thái được hỗ trợ:**
- `PUBLISHED` (Xanh/Đã Xuất Bản)
- `DRAFT` (Vàng/Bản Nháp)
- `PENDING` (Xanh dương/Chờ Duyệt)
- `HIDDEN` (Xám/Ẩn)

**Props:**
- `status` (String) - Trạng thái khóa học

## 📄 Các Trang (Pages)

### TeacherDashboardPage.jsx
**Route:** `/teacher/dashboard`

**Tính năng:**
- Thẻ thống kê: Doanh thu tổng, Học viên, Đánh giá TB, Khóa học hoạt động
- Bảng Top 5 khóa học hàng đầu (theo doanh thu/học viên)
- Biểu đồ doanh thu theo tháng

### ManageCoursesPage.jsx
**Route:** `/teacher/courses`

**Tính năng:**
- Danh sách khóa học dạng Grid
- Thẻ thống kê nhanh (Tổng khóa học, Đã xuất bản, Học viên)
- Nút "Tạo Khóa Học Mới" nổi bật
- Các action: Sửa, Thiết kế Giáo Trình
- Loading state khi tải dữ liệu

### StudentReviewsPage.jsx
**Route:** `/teacher/reviews`

**Tính năng:**
- Thẻ đánh giá tổng hợp (Sao TB, Biểu đồ phân bố sao)
- Thống kê khóa học (Sao TB từng khóa học)
- Danh sách đánh giá chi tiết (Tên học viên, Khóa học, Sao, Bình luận)
- Lọc theo số sao

### CreateCoursePage.jsx
**Route:** `/teacher/courses/create`

**Tính năng:**
- Form tạo khóa học mới
- Các trường: Tiêu đề, Mô tả, Mức độ, Giá, Trạng thái
- Xác thực: Tiêu đề bắt buộc
- Nút Tạo/Hủy

### EditCoursePage.jsx
**Route:** `/teacher/courses/edit/:courseId`

**Tính năng:**
- Form chỉnh sửa khóa học
- Giống CreateCoursePage nhưng có thêm trạng thái PUBLISHED
- Nhận dữ liệu khóa học từ state hoặc API

### CurriculumDesignPage.jsx
**Route:** `/teacher/courses/:courseId/curriculum`

**Tính năng:**
- Quản lý cấu trúc khóa học (Chương + Bài học)
- Mở rộng/Thu gọn chương
- Thêm/Xóa chương
- Thêm/Xóa bài học trong chương
- Lưu giáo trình lại backend

## 🔌 API Service (teacherService.js)

Tất cả API calls đều sử dụng Axios instance được cấu hình tại `src/api/axios.js`

**Các method:**
- `getTeacherCourses()` - GET `/teacher/courses`
- `getTeacherDashboardStats()` - GET `/teacher/dashboard/stats`
- `getCourseReviews(courseId?)` - GET `/teacher/reviews`
- `createCourse(data)` - POST `/teacher/courses`
- `updateCourse(id, data)` - PUT `/teacher/courses/{id}`
- `getCourseCurriculum(id)` - GET `/teacher/courses/{id}/curriculum`
- `updateCourseCurriculum(id, data)` - PUT `/teacher/courses/{id}/curriculum`
- `deleteCourse(id)` - DELETE `/teacher/courses/{id}`

## 🛣️ Định Tuyến (teacherRoutes.jsx)

```
/teacher (TeacherLayout - Wrapper)
├── /teacher/dashboard (TeacherDashboardPage)
├── /teacher/courses (ManageCoursesPage)
├── /teacher/courses/create (CreateCoursePage)
├── /teacher/courses/edit/:courseId (EditCoursePage)
├── /teacher/courses/:courseId/curriculum (CurriculumDesignPage)
└── /teacher/reviews (StudentReviewsPage)
```

**Cách hoạt động:**
- Nested Routes: `TeacherLayout` là layout gốc chứa sidebar/header
- Các trang con render qua `<Outlet />` trong layout
- Sidebar menu tự động highlight trang hiện tại

## 💾 Data Models

### Course Object
```javascript
{
  id: number,
  title: string,
  description: string,
  thumbnailUrl: string,
  status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'HIDDEN',
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
  price: number,
  enrollmentCount: number,
  revenue: number,
  rating: number
}
```

### Review Object
```javascript
{
  id: number,
  studentName: string,
  courseTitle: string,
  rating: 1-5,
  comment: string,
  createdAt: ISO8601 DateTime
}
```

### Chapter Object
```javascript
{
  id: number,
  title: string,
  order: number,
  lessons: Array<Lesson>
}
```

### Lesson Object
```javascript
{
  id: number,
  title: string,
  order: number,
  videoUrl: string,
  duration: number
}
```

## 🎯 Quy Ước Code

- **Naming:** camelCase cho biến/function, PascalCase cho component
- **Imports:** Lucide React icons, React hooks, React Router
- **CSS:** Tailwind utility classes, không dùng CSS files riêng
- **Responsive:** Mobile-first approach với breakpoints `md:`, `lg:`
- **State management:** React Hooks (useState, useEffect)
- **Error handling:** Try-catch với toast/alert

## ⚙️ Setup & Sử Dụng

### 1. Cài đặt dependencies (nếu chưa có)
```bash
npm install lucide-react react-router-dom axios react-toastify
```

### 2. Cấu hình API endpoint
Sửa file `src/api/axios.js`:
```javascript
const axiosInstance = axios.create({
  baseURL: 'http://your-backend-url/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 3. Thêm route vào AppRoutes.jsx (đã được thêm)
```javascript
import { teacherRoutes } from "../../features/teacher/routes/teacherRoutes";
// Sau đó thêm {teacherRoutes} vào danh sách routes
```

### 4. Chạy ứng dụng
```bash
npm run dev
```

## 🔐 Authentication

- Sử dụng `AuthProvider` context từ `src/app/provider/AuthProvider.jsx`
- User info lưu tại `localStorage` dưới key `user` và `token`
- Tự động logout khi nhấn nút "Đăng Xuất"

## 📱 Responsive Design

| Device | Sidebar | Grid |
|--------|---------|------|
| Mobile (<640px) | Drawer (toggle) | 1 column |
| Tablet (640px-1024px) | Toggle | 2 columns |
| Desktop (>1024px) | Sidebar cố định | 3 columns |

## 🚀 Features Có Thể Extend

- Thêm tính năng upload ảnh thumbnail
- Thêm preview video lesson
- Thêm tính năng bulk edit courses
- Thêm export reports (PDF/Excel)
- Thêm notification system
- Thêm analytics chi tiết hơn
- Thêm coupon/discount management
- Thêm student messaging system

## 📝 License

Phần này là một phần của dự án Chinese Online Learning Platform.
