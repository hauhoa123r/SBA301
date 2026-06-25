# MyValidEmail

## Mục đích

`@MyValidEmail` được sử dụng để đánh dấu các thuộc tính chứa địa chỉ email cần được kiểm tra định dạng hợp lệ.

---

## Cách sử dụng

Áp dụng annotation trực tiếp lên thuộc tính email trong DTO, Entity hoặc Model.

### Ví dụ trong DTO

```java
public class RegisterRequest {

    @MyValidEmail
    private String email;

    private String password;

}
```

### Tùy chỉnh thông báo lỗi

```java
public class RegisterRequest {

    @MyValidEmail(
        message = "Email phải có định dạng example@gmail.com"
    )
    private String email;

    private String password;

}
```

---

## Thuộc tính

| Thuộc tính | Mô tả                                   | Mặc định           |
| ---------- | --------------------------------------- | ------------------ |
| message    | Thông báo trả về khi email không hợp lệ | Email không hợp lệ |

---

## Trường hợp sử dụng

* Đăng ký tài khoản
* Cập nhật thông tin cá nhân
* Quản lý khách hàng
* Nhập email nhận thông báo
* Các biểu mẫu yêu cầu địa chỉ email

---

## Lưu ý

* Chỉ sử dụng cho thuộc tính kiểu `String`.
* Annotation chỉ dùng để đánh dấu trường cần kiểm tra.
* Việc kiểm tra email được thực hiện bởi Validator hoặc thành phần xử lý tương ứng.
* Có thể kết hợp với các annotation khác như `@NotNull`, `@NotBlank`, `@Size`.

### Ví dụ kết hợp

```java
public class RegisterRequest {

    @NotBlank
    @MyValidEmail
    private String email;

}
```

---

## Kết quả mong đợi

| Giá trị email                           | Kết quả                                  |
| --------------------------------------- | ---------------------------------------- |
| [user@gmail.com](mailto:user@gmail.com) | Hợp lệ                                   |
| [abc@yahoo.com](mailto:abc@yahoo.com)   | Hợp lệ                                   |
| usergmail.com                           | Không hợp lệ                             |
| @gmail.com                              | Không hợp lệ                             |
| user@                                   | Không hợp lệ                             |
| rỗng                                    | Không hợp lệ (khi kết hợp với @NotBlank) |
