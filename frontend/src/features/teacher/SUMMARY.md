# Teacher Dashboard - Hướng Dẫn Kỹ Thuật Chi Tiết

## 📋 Mục Lục
1. [Tổng Quan Kiến Trúc](#tổng-quan-kiến-trúc)
2. [Cấu Trúc File](#cấu-trúc-file)
3. [Hướng Dẫn Component](#hướng-dẫn-component)
4. [Hướng Dẫn Pages](#hướng-dẫn-pages)
5. [Cấu Hình Routes](#cấu-hình-routes)
6. [API Integration](#api-integration)
7. [Theme & Styling](#theme--styling)

---

## 🏗️ Tổng Quan Kiến Trúc

### Feature-Based Architecture
```
src/features/teacher/
├── components/     # Reusable UI components
├── pages/          # Page components
├── routes/         # Route definitions
├── service/        # API & business logic
└── README.md       # Documentation
```

### Design Pattern
- **Layout Pattern:** Nested Routes với Layout Wrapper
- **State Management:** React Hooks (useState, useEffect)
- **Data Fetching:** Axios with async/await
- **Routing:** React Router v6 with `<Outlet />`

---

## 📁 Cấu Trúc File Chi Tiết

### `components/TeacherLayout.jsx`

**Chức năng:** Wrapper layout cho toàn bộ teacher module

**Cấu trúc:**
```
┌─────────────────────────────────────┐
│         Header (Sticky)              │
│  Logo | Search | Bell | Avatar      │
├──────────────┬──────────────────────┤
│              │                      │
│   Sidebar    │   Main Content       │
│  (Fixed/      │   (<Outlet />)      │
│   Drawer)     │                      │
│              │                      │
└──────────────┴──────────────────────┘
```

**Key Props & State:**
```javascript
- sidebarOpen: Boolean - Trạng thái mở/đóng sidebar
- mobileMenuOpen: Boolean - Menu di động trên mobile
- expandedChapter: ID - Chapter nào đang mở rộng
- displayName: String - Tên giáo viên
- avatarUrl: String - URL avatar
```

**Navigation Items:**
- Thống Kê → `/teacher/dashboard`
- Khóa Học → `/teacher/courses`
- Đánh Giá → `/teacher/reviews`

**Responsive Breakpoints:**
```css
- md: 768px (Sidebar từ drawer sang fixed)
- lg: 1024px (Layout tối ưu desktop)
```

### `components/CoursesGrid.jsx`

**Mục đích:** Render grid danh sách khóa học

**Props:**
```javascript
{
  courses: Array<Course>,                    // Mảng khóa học
  onEditCourse: Function(course),            // Callback sửa
  onDesignCurriculum: Function(course)       // Callback thiết kế
}
```

**Features:**
- Hiển thị 3 cột (desktop), 2 cột (tablet), 1 cột (mobile)
- Hover effect: Scale thumbnail, shadow
- Badge trạng thái có màu sinh động
- Nút action hover vào

**Empty State:**
```javascript
Nếu courses.length === 0:
- Hiển thị icon BookOpen
- Text: "Chưa có khóa học nào"
- Gợi ý: "Hãy tạo khóa học đầu tiên"
```

### `components/StatusBadge.jsx`

**Mục đích:** Hiển thị trạng thái khóa học

**Mapping:**
```javascript
PUBLISHED  → Green (bg-green-100, text-green-800)  → "Đã Xuất Bản"
DRAFT      → Yellow (bg-yellow-100, text-yellow-800) → "Bản Nháp"
PENDING    → Blue (bg-blue-100, text-blue-800)    → "Đang Chờ"
HIDDEN     → Gray (bg-gray-100, text-gray-800)    → "Ẩn"
```

---

## 📄 Hướng Dẫn Pages

### `pages/TeacherDashboardPage.jsx`

**Route:** `/teacher/dashboard`

**Layout:**
```
┌────────────────────────────────────┐
│  Tiêu đề: Bảng Điều Khiển          │
├────────┬────────┬────────┬────────┤
│ Doanh  │ Học    │ Đánh   │ Khóa   │
│ Thu    │ Viên   │ Giá    │ Học    │
├──────────────────┬─────────────────┤
│  Top 5 Khóa Học  │ Doanh Thu/Tháng │
│  (Danh sách)     │ (Biểu đồ bar)   │
└──────────────────┴─────────────────┘
```

**State:**
```javascript
stats: {
  totalRevenue: number,
  totalStudents: number,
  averageRating: number,
  totalCourses: number,
  topCourses: Array,
  revenueData: Array
}
```

**API Call:**
```javascript
const response = await getTeacherDashboardStats();
// Response: { totalRevenue, totalStudents, ... }
```

### `pages/ManageCoursesPage.jsx`

**Route:** `/teacher/courses`

**Layout:**
```
┌──────────────────────────────────────┐
│ Khóa Học Của Tôi | [+ Khóa Học Mới] │
├────────┬────────┬────────┐
│ Stat   │ Stat   │ Stat   │  (3 thẻ thống kê)
├────────────────────────────┤
│    Khóa Học Grid (3 col)   │
│ [Card] [Card] [Card]       │
│ [Card] [Card] [Card]       │
└────────────────────────────┘
```

**Functions:**
```javascript
handleCreateCourse()      // Navigate to /teacher/courses/create
handleEditCourse(course)  // Navigate to /teacher/courses/edit/:id
handleDesignCurriculum(course) // Navigate to /teacher/courses/:id/curriculum
```

**Error Handling:**
```javascript
if (loading) → Spinner animation
if (error) → Red alert box
if (!courses) → Empty state from CoursesGrid
```

### `pages/StudentReviewsPage.jsx`

**Route:** `/teacher/reviews`

**Layout:**
```
┌────────────────────────────────────┐
│ Đánh Giá Từ Học Viên               │
├─────────────────┬──────────────────┤
│  Đánh Giá TB    │  Thống Kê Khóa   │
│  (4.5 sao)      │  Học             │
│  (Bar chart)    │  (Danh sách)     │
├────────────────────────────────────┤
│       Danh Sách Đánh Giá Chi Tiết   │
│  [Avatar] Học viên | Khóa | Sao    │
│  ⭐⭐⭐⭐⭐ Bình luận...     │
└────────────────────────────────────┘
```

**Calculations:**
```javascript
averageRating = sum(rating) / reviews.length
ratingStats = [5,4,3,2,1].map(star => count)
```

### `pages/CreateCoursePage.jsx`

**Route:** `/teacher/courses/create`

**Form Fields:**
```
[✓] Tiêu Đề Khóa Học (text, required)
[ ] Mô Tả Khóa Học (textarea, optional)
[ ] Mức Độ (select: BEGINNER/INTERMEDIATE/ADVANCED)
[ ] Giá (number, min=0, step=0.01)
[ ] Trạng Thái (select: DRAFT/PENDING)
```

**Validation:**
```javascript
- title.trim() must not be empty → Error: "Tiêu đề không được để trống"
- price ≥ 0
- All inputs trigger onChange immediately
```

**Form Submission:**
```javascript
handleSubmit(e) {
  e.preventDefault();
  if (!formData.title.trim()) {
    setError("...");
    return;
  }
  await createCourse(formData);
  navigate('/teacher/courses', { state: { message: "..." } });
}
```

### `pages/EditCoursePage.jsx`

**Route:** `/teacher/courses/edit/:courseId`

**Differences from CreateCoursePage:**
- Receives `course` from `location.state`
- Form fields pre-filled with existing data
- Status select includes `PUBLISHED` option
- Button text: "Lưu Thay Đổi" instead of "Tạo Khóa Học"
- API call: `updateCourse(courseId, data)`

### `pages/CurriculumDesignPage.jsx`

**Route:** `/teacher/courses/:courseId/curriculum`

**Structure:**
```
Chapter 1
├── Lesson 1
├── Lesson 2
├── [New Lesson Input]

Chapter 2
├── Lesson 1
├── [New Lesson Input]

[New Chapter Input]
```

**Features:**
- Expandable chapters (chevron icon)
- Reorder lessons (drag-drop ready)
- Add/Delete chapter & lesson
- Save to backend
- State management with chapters array

**State Pattern:**
```javascript
chapters: [
  {
    id: number,
    title: string,
    lessons: [
      { id, title, order, isNew },
      ...
    ]
  }
]
```

---

## 🛣️ Cấu Hình Routes

### `routes/teacherRoutes.jsx`

**Exported as JSX element:**
```javascript
export const teacherRoutes = (
  <Route path="teacher" element={<TeacherLayout />}>
    <Route path="dashboard" element={<TeacherDashboardPage />} />
    <Route path="courses" element={<ManageCoursesPage />} />
    <Route path="courses/create" element={<CreateCoursePage />} />
    <Route path="courses/edit/:courseId" element={<EditCoursePage />} />
    <Route path="courses/:courseId/curriculum" element={<CurriculumDesignPage />} />
    <Route path="reviews" element={<StudentReviewsPage />} />
  </Route>
);
```

**Integration in AppRoutes.jsx:**
```javascript
import { teacherRoutes } from "../../features/teacher/routes/teacherRoutes";

// In renderRoute logic:
{teacherRoutes}
```

---

## 🔌 API Integration

### Service Layer: `service/teacherService.js`

**Base URL:** `/teacher`

**Methods:**

#### 1. getTeacherCourses()
```javascript
GET /teacher/courses
Response: {
  data: Array<Course> | Course[]
}
```

#### 2. getTeacherDashboardStats()
```javascript
GET /teacher/dashboard/stats
Response: {
  totalRevenue: number,
  totalStudents: number,
  averageRating: number,
  totalCourses: number,
  topCourses: Array,
  revenueData: Array
}
```

#### 3. getCourseReviews(courseId?)
```javascript
GET /teacher/reviews?courseId=123 (optional filter)
Response: Array<Review>
```

#### 4. createCourse(courseData)
```javascript
POST /teacher/courses
Body: {
  title: string,
  description: string,
  level: string,
  price: number,
  status: string
}
Response: Course
```

#### 5. updateCourse(courseId, courseData)
```javascript
PUT /teacher/courses/:courseId
Body: (same as createCourse)
Response: Course
```

#### 6. getCourseCurriculum(courseId)
```javascript
GET /teacher/courses/:courseId/curriculum
Response: Array<Chapter>
```

#### 7. updateCourseCurriculum(courseId, data)
```javascript
PUT /teacher/courses/:courseId/curriculum
Body: { chapters: Array<Chapter> }
Response: Chapter[]
```

### Error Handling Pattern
```javascript
try {
  const response = await axios.get(url);
  return response.data;
} catch (error) {
  throw new Error(error.response?.data?.message || 'Default error message');
}
```

---

## 🎨 Theme & Styling

### Tailwind Color Palette

```javascript
// Primary Colors
bg-teal-600   → Button primary background
bg-teal-700   → Button hover
text-teal-600 → Links, primary text

// Secondary Colors
bg-gray-50    → Page background
bg-white      → Cards, containers
bg-gray-100   → Input focus, hover states

// Text Colors
text-gray-900 → Primary text
text-gray-600 → Secondary text
text-gray-400 → Tertiary text

// Status Colors
bg-green-100, text-green-800   → Published
bg-yellow-100, text-yellow-800 → Draft/Pending
bg-blue-100, text-blue-800     → Pending
bg-red-100, text-red-800       → Errors

// Border
border-gray-200 → Default borders
border-gray-100 → Subtle dividers
```

### Responsive Utilities
```css
/* Mobile First Approach */
default   → Mobile (<640px)
sm:       → Small (640px+)
md:       → Medium (768px+)    [Main breakpoint]
lg:       → Large (1024px+)
xl:       → Extra Large (1280px+)

/* Usage Example */
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

### Reusable Classes

**Buttons:**
```jsx
// Primary Button
className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors duration-200"

// Secondary Button
className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
```

**Cards:**
```jsx
className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
```

**Forms:**
```jsx
// Input
className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"

// Textarea
className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 resize-none"

// Select
className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500"
```

---

## 🔄 Data Flow Example: Create Course

```
1. User clicks [+ Khóa Học Mới]
   ↓
2. Navigate to /teacher/courses/create
   → CreateCoursePage renders
   ↓
3. User fills form & clicks "Tạo Khóa Học"
   ↓
4. handleSubmit triggered
   ├─ Validate title
   ├─ setLoading(true)
   ├─ Call await createCourse(formData)
   │  ├─ POST /teacher/courses
   │  ├─ Response: New Course object
   │  └─ Return
   ├─ setLoading(false)
   └─ Navigate to /teacher/courses with success message
   ↓
5. ManageCoursesPage re-fetches courses
   ↓
6. New course appears in grid
```

---

## 📱 Mobile Responsive Example

```javascript
// Desktop (lg: breakpoint)
┌─ Sidebar ─┬──────── Main Content ────────┐
│           │ [Card] [Card] [Card]        │
│ Menu      │ [Card] [Card] [Card]        │
│           │ [Card] [Card] [Card]        │
└───────────┴───────────────────────────────┘

// Tablet (md: breakpoint)
┌─ Sidebar ─┬────── Main Content ─────┐
│           │ [Card] [Card]           │
│ Menu      │ [Card] [Card]           │
│           │ [Card] [Card]           │
└───────────┴─────────────────────────┘

// Mobile (default)
┌─ [≡] ─────────────────────────────────┐
│ Header                                │
├───────────────────────────────────────┤
│ [Card]                                │
│ [Card]                                │
│ [Card]                                │
└───────────────────────────────────────┘
```

---

## 🚀 Performance Tips

1. **Code Splitting:** Các page tự động split khi import
2. **Lazy Loading:** Nội dung chỉ fetch khi trang được truy cập
3. **Memoization:** Component pure, không re-render vô ích
4. **State Lifting:** State được lift lên TeacherLayout khi cần

---

## ✅ Testing Checklist

- [ ] Sidebar toggle mobile/desktop
- [ ] Navigate between pages (dashboard/courses/reviews)
- [ ] Create course (validation errors)
- [ ] Edit course
- [ ] Design curriculum (add/delete chapter & lesson)
- [ ] View reviews (rating calculation)
- [ ] Logout button
- [ ] Responsive layout (test mobile/tablet/desktop)
- [ ] API error handling (network down, 404, 500)
- [ ] Empty states (no courses, no reviews)

---

## 📚 Tài Liệu Tham Khảo

- React Router v6: https://reactrouter.com/
- Tailwind CSS: https://tailwindcss.com/
- Lucide Icons: https://lucide.dev/
- Axios: https://axios-http.com/

---

**Last Updated:** 2024
**Version:** 1.0.0
