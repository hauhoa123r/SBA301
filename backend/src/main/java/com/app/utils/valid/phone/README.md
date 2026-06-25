# VietnamPhone Validation

## Mục đích

Kiểm tra định dạng số điện thoại Việt Nam thông qua Custom Annotation và Reflection.

---

## Thành phần

### VietnamPhone

Annotation đánh dấu các thuộc tính cần kiểm tra định dạng số điện thoại Việt Nam.

Ví dụ:

```java
@VietnamPhone
private String phoneNumber;
```

---

### MyPhoneValidator

Chứa logic kiểm tra số điện thoại bằng Regular Expression.

Điều kiện hợp lệ:

* Bắt đầu bằng:

  * 03
  * 05
  * 07
  * 08
  * 09
* Tổng cộng 10 chữ số.

Ví dụ hợp lệ:

```text
0912345678
0321234567
0781234567
```

Ví dụ không hợp lệ:

```text
0123456789
123456789
09123456789
```

---

### ValidationPhoneEngine

Sử dụng Reflection để:

1. Quét tất cả Field của đối tượng.
2. Kiểm tra Field có được đánh dấu bởi `@VietnamPhone` hay không.
3. Lấy giá trị của Field.
4. Gọi `MyPhoneValidator`.
5. Ném Exception nếu dữ liệu không hợp lệ.

---

## Cách sử dụng

### DTO

```java
public class RegisterRequest {

    @VietnamPhone
    private String phoneNumber;

}
```

### Validate

```java
ValidationPhoneEngine.validate(request);
```

---

## Kết quả

Nếu số điện thoại hợp lệ:

```text
Validation thành công
```

Nếu số điện thoại không hợp lệ:

```text
RuntimeException:
Số điện thoại Việt Nam không hợp lệ
```

Hoặc thông báo được cấu hình trong thuộc tính `message` của Annotation.
