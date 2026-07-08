# Teacher Feature Overview

Thư mục này mô tả tổng quan về module teacher trong frontend, bao gồm cấu trúc thư mục, vai trò từng nhóm file và cách dữ liệu được đổ từ Backend vào UI.

## 1. Cấu trúc thư mục

```text
src/features/teacher/
├── components/
│   ├── course-form/
│   │   ├── CategorySelect.jsx
│   │   ├── PlanSelector.jsx
│   │   ├── TagSelector.jsx
│   │   └── CourseForm.jsx
│   ├── CourseCard.jsx
│   ├── curriculum-builder/
│   └── StatusBadge.jsx
├── layout/
├── pages/
│   ├── CreateCoursePage.jsx
│   ├── CurriculumDesignPage.jsx
│   ├── EditCoursePage.jsx
│   ├── ManageCoursesPage.jsx
│   ├── StudentReviewsPage.jsx
│   └── TeacherDashboardPage.jsx
├── routes/
│   └── teacherRoutes.jsx
└── service/
    └── teacherService.js
```

## 2. Vai trò từng phần

### components/
Chứa các UI component dùng cho module teacher.

- course-form/
  - `CategorySelect.jsx`: select category cho form tạo/chỉnh sửa khóa học.
  - `TagSelector.jsx`: chọn tag bằng UI dạng pill/button.
  - `PlanSelector.jsx`: chọn membership plan dạng card.
  - `CourseForm.jsx`: component chính điều phối form, quản lý state và submit.

- `CourseCard.jsx`
  - Hiển thị card khóa học trong danh sách quản lý.

- `curriculum-builder/`
  - Chứa các component liên quan đến việc thiết kế chương trình học / curriculum.

- `StatusBadge.jsx`
  - Hiển thị badge trạng thái khóa học như Draft, Pending, Published.

### pages/
Chứa các màn hình route chính của teacher.

- `CreateCoursePage.jsx`: màn hình tạo khóa học mới.
- `EditCoursePage.jsx`: màn hình chỉnh sửa khóa học.
- `ManageCoursesPage.jsx`: màn hình quản lý danh sách khóa học.
- `CurriculumDesignPage.jsx`: màn hình thiết kế curriculum cho khóa học.
- `StudentReviewsPage.jsx`: màn hình xem đánh giá học viên.
- `TeacherDashboardPage.jsx`: dashboard tổng quan cho teacher.

### routes/
- `teacherRoutes.jsx`: định nghĩa các route của module teacher.

### service/
- `teacherService.js`: nơi tập trung tất cả các call API liên quan đến teacher.

## 3. Luồng dữ liệu từ Backend vào UI

### A. Dữ liệu đi qua service layer
Tất cả request từ frontend đến backend đều đi qua `teacherService.js`.

Ví dụ:

- `getCourses()` → lấy danh sách khóa học
- `createCourse(data)` → tạo khóa học mới
- `updateCourse(id, data)` → cập nhật khóa học
- `getTags()` → lấy danh sách tag
- `getPlans()` → lấy danh sách plan
- `getCategories()` → lấy danh sách category

### B. Page gọi service rồi truyền dữ liệu vào component
Ví dụ flow cho Create/Edit Course:

1. `CreateCoursePage` hoặc `EditCoursePage` gọi `teacherService`.
2. Service gọi API bằng `axiosInstance`.
3. Dữ liệu trả về được đưa vào state của page hoặc form component.
4. Component con như `CategorySelect`, `TagSelector`, `PlanSelector` nhận props và render UI.

### C. Cấu trúc dữ liệu backend thường dùng

#### Tags
```json
{
  "id": 1,
  "name": "Pinyin"
}
```

#### Plans
```json
{
  "id": 1,
  "name": "Basic 1 tháng",
  "price": 199000,
  "durationDay": null
}
```

#### Categories
```json
{
  "id": 1,
  "name": "Chinese"
}
```

## 4. Mô hình hoạt động của form khóa học

Form tạo/chỉnh sửa khóa học có thể hiểu như sau:

- `CourseForm.jsx` là component trung tâm (orchestrator)
  - quản lý state `formData`
  - xử lý submit
  - điều phối dữ liệu từ backend vào các sub-component

- `CategorySelect.jsx`
  - nhận danh sách category từ parent
  - render dropdown chọn category

- `TagSelector.jsx`
  - nhận danh sách tag và các ID tag đã chọn
  - render các tag dưới dạng pill/button

- `PlanSelector.jsx`
  - nhận danh sách plan và các ID plan đã chọn
  - render card để người dùng chọn plan
  - format giá theo VND bằng `Intl.NumberFormat`

## 5. Ví dụ luồng thực tế

```jsx
// Page -> Service
const response = await teacherService.getTags();

// Service -> Parent component
setMasterData({ tags: response });

// Parent -> Child component
<TagSelector tags={masterData.tags} selectedTagIds={formData.tagIds} />
```

## 6. Nguyên tắc thiết kế hiện tại

- `pages/` chịu trách nhiệm màn hình và routing.
- `service/` chịu trách nhiệm gọi API.
- `components/` chịu trách nhiệm render giao diện.
- `CourseForm` là nơi kết nối dữ liệu từ service vào UI.

## 7. Gợi ý khi mở rộng

Khi thêm tính năng mới cho teacher, nên tuân theo quy tắc:

1. Thêm API method vào `teacherService.js`
2. Gọi API từ page hoặc form component
3. Truyền dữ liệu xuống component con qua props
4. Giữ logic submit và state ở component cha để dễ kiểm soát

---
Nếu cần, mình có thể tiếp tục viết thêm một phiên bản README chi tiết hơn theo kiểu architecture diagram hoặc Mermaid flowchart.
