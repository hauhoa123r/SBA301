Cách sử dụng BaseException và GlobalExceptionHandler
Tạo Exception

Tạo Exception kế thừa từ BaseException và cấu hình HttpStatus mong muốn.

Ví dụ:

public class InvalidLoginException extends BaseException {

    public InvalidLoginException(String message) {
        super(HttpStatus.BAD_REQUEST, message);
    }
}
Sử dụng trong Service

Khi xảy ra lỗi nghiệp vụ, chỉ cần throw Exception tương ứng.

Ví dụ:

@Override
public LoginResponse IsExistUser(LoginRequest user) {

    UserEntity userEntity = userRepositoryImpl.findByEmail(user.getUsername())
            .orElseThrow(() ->
                    new InvalidLoginException("Email không tồn tại"));

    if (!userEntity.getPassword().equals(user.getPassword())) {
        throw new InvalidLoginException("Sai mật khẩu");
    }

    return loginConverter.loginConverter(userEntity);
}
Kết quả
Không cần viết try-catch.
Không cần tạo ResponseEntity trong Service.
Không cần tạo @ExceptionHandler cho từng Exception.

Chỉ cần:

throw new InvalidLoginException("Sai mật khẩu");

hoặc

throw new InvalidLoginException("Email không tồn tại");

GlobalExceptionHandler sẽ tự động bắt Exception và trả về Response theo HttpStatus và message đã khai báo.