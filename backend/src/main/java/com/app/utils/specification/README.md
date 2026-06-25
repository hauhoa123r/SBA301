# Dynamic JPA Specification

Module hỗ trợ xây dựng truy vấn động bằng Spring Data JPA Specification thông qua Annotation.

## Tính năng

* Dynamic Search bằng DTO
* Hỗ trợ Nested Field (Join)
* Hỗ trợ INNER JOIN, LEFT JOIN, RIGHT JOIN
* Tự động tạo Predicate
* Hỗ trợ Pageable
* Tái sử dụng cho mọi Entity

---

# 1. Annotation @SearchField

Sử dụng để đánh dấu các trường được dùng làm điều kiện tìm kiếm.

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface SearchField {

    String entityField() default "";

    OperatorEnum operator() default OperatorEnum.EQUAL;

    JoinType joinType() default JoinType.INNER;
}
```

## Thuộc tính

| Thuộc tính  | Mô tả                               |
| ----------- | ----------------------------------- |
| entityField | Tên field trong entity              |
| operator    | Toán tử tìm kiếm                    |
| joinType    | Kiểu JOIN khi truy vấn nested field |

---

# 2. Operator hỗ trợ

```java
public enum OperatorEnum {

    EQUAL,

    LIKE,

    GREATER_THAN,

    LESS_THAN,

    GREATER_THAN_EQUAL,

    LESS_THAN_EQUAL,

    IN,

    BETWEEN
}
```

---

# 3. Ví dụ Entity

```java
@Entity
public class User {

    @Id
    private Long id;

    private String fullName;

    private Integer age;

    @ManyToOne
    private Department department;
}
```

```java
@Entity
public class Department {

    @Id
    private Long id;

    private String name;
}
```

---

# 4. Tạo Search DTO

```java
@Getter
@Setter
public class UserSearchDto {

    @SearchField(operator = OperatorEnum.LIKE)
    private String fullName;

    @SearchField(operator = OperatorEnum.GREATER_THAN_EQUAL)
    private Integer age;

    @SearchField(
            entityField = "department.name",
            operator = OperatorEnum.LIKE,
            joinType = JoinType.LEFT
    )
    private String departmentName;
}
```

---

# 5. Repository

Repository phải kế thừa JpaSpecificationExecutor

```java
public interface UserRepository extends
        JpaRepository<User, Long>,
        JpaSpecificationExecutor<User> {
}
```

---

# 6. Tạo Specification

```java
Specification<User> specification =
        new MySpecification<>(searchDto);
```

---

# 7. Query không phân trang

```java
List<User> users =
        userRepository.findAll(
                new MySpecification<>(searchDto)
        );
```

Spring sẽ tự sinh SQL tương ứng với các field có giá trị khác null trong DTO.

---

# 8. Query có phân trang

## Tạo Pageable

```java
Pageable pageable =
        PageRequest.of(
                page,
                size
        );
```

Ví dụ:

```java
Pageable pageable =
        PageRequest.of(0, 10);
```

Ý nghĩa:

* page = 0 -> trang đầu tiên
* size = 10 -> mỗi trang 10 bản ghi

---

## Query Page

```java
Page<User> pageResult =
        userRepository.findAll(
                new MySpecification<>(searchDto),
                pageable
        );
```

---

## Lấy dữ liệu

```java
List<User> users =
        pageResult.getContent();
```

---

## Tổng số bản ghi

```java
long totalElements =
        pageResult.getTotalElements();
```

---

## Tổng số trang

```java
int totalPages =
        pageResult.getTotalPages();
```

---

## Trang hiện tại

```java
int currentPage =
        pageResult.getNumber();
```

---

# 9. Query có Sort

```java
Pageable pageable =
        PageRequest.of(
                0,
                10,
                Sort.by("fullName").ascending()
        );
```

Hoặc:

```java
Pageable pageable =
        PageRequest.of(
                0,
                10,
                Sort.by("age").descending()
        );
```

---

# 10. Service Example

```java
public Page<User> search(
        UserSearchDto dto,
        int page,
        int size
) {

    Pageable pageable =
            PageRequest.of(page, size);

    return userRepository.findAll(
            new MySpecification<>(dto),
            pageable
    );
}
```

---

# 11. Controller Example

```java
@GetMapping("/search")
public Page<User> search(
        UserSearchDto dto,
        @RequestParam(defaultValue = "0")
        int page,
        @RequestParam(defaultValue = "10")
        int size
) {

    return userService.search(
            dto,
            page,
            size
    );
}
```

Ví dụ request:

```http
GET /users/search?fullName=nguyen&age=18&page=0&size=10
```

Kết quả:

* fullName LIKE '%nguyen%'
* age >= 18
* trả về dữ liệu phân trang.

```
```
