# Custom Validation Annotations (Spring Boot)

Tài liệu hướng dẫn sử dụng bộ annotation validation custom:

- @CustomEmail ^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$
- @VietnamPhone ^(03|05|07|08|09)[0-9]{8}$
- @StrongPassword ^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,16}$

⚠️ Lưu ý: Các annotation này chỉ validate FORMAT, KHÔNG kiểm tra null/empty.  
Luôn kết hợp với `@NotBlank` (Jakarta Validation).
