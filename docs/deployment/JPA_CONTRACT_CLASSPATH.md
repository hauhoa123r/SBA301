# Jenkins Maven schema contract: classpath resources

## Root cause

`JpaSchemaContractTest` dòng 110 trước sửa đọc `Files.readAllLines(Path.of("..", "database", "jpa-schema-contract.tsv"))`.

Contract `database/jpa-schema-contract.tsv` tồn tại, được Git theo dõi, không bị .gitignore loại bỏ. Lỗi không phải thiếu file trong Git checkout:

- Jenkins TEST_BEFORE_RELEASE chạy `docker build --target build ... backend`.
- Build context chỉ là backend, `backend/Dockerfile` dùng WORKDIR /backend và COPY . .; thư mục database ở ngoài context. Docker chỉ có thể COPY các files trong [build context](https://docs.docker.com/build/concepts/context/).
- `docker run ... mvn test` kế thừa working directory /backend; đường dẫn cũ trở thành /database/jpa-schema-contract.tsv, không tồn tại trong image.
- Fresh-MySQL stage trước đây mount database vào /database nên che khuất dependency ngoài context; full Maven test stage không có mount này.
- backend/.dockerignore loại target/env/keys/git/node_modules/dist, không loại src/test/resources. POM dùng layout Maven chuẩn, không override testResources.

## Thay đổi

1. Giữ nguyên canonical contract `database/jpa-schema-contract.tsv`: 472 dòng, mapping của 54 Entity / 55 bảng / 336 cột JPA cùng PK, UK, FK và join tables.
2. Thêm bản sao byte-for-byte `backend/src/test/resources/schema/jpa-schema-contract.tsv`. `database/generate-schema-check.py` sync bản sao khi generate; --check kiểm tra cả SQL guard và resource đồng bộ. Resource được commit để backend context tự đủ dữ liệu; không cần mở rộng Docker context ra toàn repository.
3. `JpaSchemaContractTest` đọc classpath stream `/schema/jpa-schema-contract.tsv` bằng UTF-8. Missing resource vẫn làm test fail; so sánh toàn bộ rows không bị bỏ/skip hoặc chuyển thành kiểm tra một phần. Maven copy [test resources vào test classpath](https://maven.apache.org/guides/introduction/introduction-to-the-standard-directory-layout.html).
4. Thêm hai JUnit regressions dùng cùng comparator để xác nhận contract thiếu authentication_settings hoặc lesson_progress.position_seconds bị từ chối. Fresh MySQL Hibernate validate/SELECT/default/constraint test được giữ nguyên.
5. Backend Dockerfile kiểm tra target/test-classes/schema/jpa-schema-contract.tsv có nội dung sau package -DskipTests (vẫn compile tests/copy test resources, không phải maven.test.skip).
6. Jenkins đặt --workdir /backend rõ ràng, kiểm tra artifact trước mvn test, và bỏ mount /database khỏi fresh-schema JPA run. Cả hai đường Maven đều dùng resources trong image.
7. Thêm năm Python regressions cho generator: chạy từ CWD khác, thiếu resource, stale resource, sync bytes không đổi contract/SQL và khả năng tạo lại generated files bị thiếu.

Không thay .gitignore, .dockerignore, pom.xml, JPA models hoặc SQL schema; không sửa DB/volume production, push hoặc deploy.

## Regenerate khi JPA thay đổi

Review schema trước khi regenerate. Chỉ chọn method exporter để tạo canonical mới; output bắt buộc là absolute path, không phụ thuộc Maven CWD. Sau review TSV, chạy generator để sync test resource và SQL guard, rồi chạy full tests:

```bash
cd backend
mvn '-Dtest=JpaSchemaContractTest#committedContractMatchesEveryEntityAndJoinTable' \
  "-Dschema.contract.output=$PWD/target/jpa-schema-contract.tsv" test
cp target/jpa-schema-contract.tsv ../database/jpa-schema-contract.tsv
cd ..
python database/generate-schema-check.py
python database/generate-schema-check.py --check
mvn -f backend/pom.xml test
```

Commit canonical TSV, generated resource và SQL guard nếu có thay đổi được review. Không chỉnh riêng generated resource để che mismatch.

## Kiểm chứng

- Full Maven suite bằng Java 17: **225 tests, 0 failures, 0 errors, 27 skipped**; 198 thực thi/pass. Số test tăng hai nhờ negative contract regressions; không thêm điều kiện skip vào test cũ.
- Isolated backend-only copy: không có thư mục database bên cạnh, không copy target cũ; invoke Maven bằng absolute -f từ working directory khác. Java 17 / Maven 3.9.6 chạy clean verify thành công, cùng 225/0/0/27, tạo executable Spring Boot JAR và resource trong target/test-classes.
- Bật cả RUN_MYSQL_INTEGRATION_TESTS và RUN_FRESH_SCHEMA_TESTS trên một MySQL 8.0.45/datadir/loopback riêng, import đầy đủ 4 SQL init files: **toàn bộ 225 Maven tests thực thi/pass, 0 failures, 0 errors, 0 skipped**, ngay trong backend-only copy không có ../database và invoke từ CWD khác. Instance riêng đã shutdown. CI mặc định vẫn giữ các conditions có sẵn cho tests yêu cầu MySQL, không mở kết nối DB ngoài ý muốn.
- Resource đóng gói có cùng SHA256 với canonical: `77b7373a2aaf4363a08b230607eb39d40a17ed4b8b45f9cb72283aaa5ee48316` tại checkout Windows này. Canonical TSV và check-schema.sql giữ nguyên bytes; index Git dùng LF nên hash trên Linux có thể khác, nhưng hai TSV phải khớp nhau trên cùng checkout.
- Python suites: 22 database regression tests và 15 deployment tests đạt; schema generator --check, Jenkins shell syntax và git diff --check đạt.
- Actual MySQL/JPA trên instance native MySQL 8.0.45 riêng, loopback port 33087 và datadir mới: 4 JpaSchemaContractTest methods đạt, không skip. Hibernate validate trả nonzero khi thiếu authentication_settings hoặc position_seconds; error diagnostic xác nhận đúng missing table/column. Sau khi khôi phục từng fixture, validation lại đạt. Instance riêng đã shutdown; không thay DB/volume production.

Docker daemon local chưa khả dụng, nên chưa chạy Linux Docker build hoặc Jenkins end-to-end. Isolated build kiểm chứng đúng backend-only context, classpath packaging, Java 17 và không phụ thuộc ../database; nó không được báo là container test đã chạy. Jenkins dùng Maven 3.9.9 / Temurin 17 trong image build hiện hữu, có packaging gate và full suite trước push/deploy.

## Chạy lại Jenkins

Sau khi thay đổi đã có trong branch Jenkins checkout, pipeline tự chạy generator --check, build image test và kiểm tra resource trước Maven. Có thể xác minh riêng trên Docker-enabled host, không deploy:

```bash
python database/generate-schema-check.py --check
docker build --target build -t edujar-backend-tests:contract-classpath backend
docker run --rm --workdir /backend --entrypoint test \
  edujar-backend-tests:contract-classpath -s /backend/target/test-classes/schema/jpa-schema-contract.tsv
docker run --rm --workdir /backend edujar-backend-tests:contract-classpath mvn test
```

Không cần mount repository database hoặc sửa working directory để tìm contract. Việc rerun toàn Jenkins pipeline vẫn đi theo deployment parameters hiện hữu; agent chưa chạy pipeline/deploy trong lượt sửa này.
