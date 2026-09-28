-- Cập nhật database đã có dữ liệu; không chạy lại DataChinese.sql.
-- Xóa đúng khóa demo seed ID 9, tên Mini HSK 1 5K, giá 5.000 đồng,
-- cùng nội dung học, tiến độ, đánh giá và giao dịch thử của khóa này.
-- Các UPDATE chỉ sửa giá trị seed cũ khớp chính xác, giữ nội dung đã tùy chỉnh.
-- Có thể chạy lại. Nếu có lỗi, dừng thực thi và ROLLBACK trước khi thử lại.
USE chinese_online_learning;
SET NAMES utf8mb4;

START TRANSACTION;

SET @mini_hsk_demo_id = (
    SELECT id FROM courses
    WHERE id = 9 AND BINARY title = BINARY 'Mini HSK 1 5K' AND price = 5000.00
);

-- Báo cáo dùng target_id đa hình nên không được xóa tự động bằng khóa ngoại.
DELETE r FROM reports r
WHERE r.target_type = 'COURSE' AND r.target_id = @mini_hsk_demo_id;

DELETE r FROM reports r
JOIN course_reviews cr ON cr.id = r.target_id
WHERE r.target_type = 'REVIEW' AND cr.course_id = @mini_hsk_demo_id;

DELETE r FROM reports r
JOIN lesson_qa qa ON qa.id = r.target_id
JOIN lessons l ON l.id = qa.lesson_id
JOIN chapters ch ON ch.id = l.chapter_id
WHERE r.target_type = 'COMMENT' AND ch.course_id = @mini_hsk_demo_id;

-- quizzes liên kết bài/chương bằng SET NULL: xóa trước để tránh quiz mồ côi.
DELETE q FROM quizzes q
LEFT JOIN lessons l ON l.id = q.lesson_id
LEFT JOIN chapters lesson_ch ON lesson_ch.id = l.chapter_id
LEFT JOIN chapters quiz_ch ON quiz_ch.id = q.chapter_id
WHERE q.course_id = @mini_hsk_demo_id
   OR lesson_ch.course_id = @mini_hsk_demo_id
   OR quiz_ch.course_id = @mini_hsk_demo_id;

-- invoices chặn xóa course; payments và refunds được xóa theo CASCADE.
DELETE FROM invoices WHERE course_id = @mini_hsk_demo_id;

-- Các bảng con còn lại dùng ON DELETE CASCADE trong schema của dự án.
DELETE FROM courses WHERE id = @mini_hsk_demo_id;

-- Chuẩn hóa tiếng Việt trong dữ liệu mẫu hiện có.

-- roles
UPDATE roles SET description = 'Quản trị viên toàn hệ thống'
WHERE id = 1 AND BINARY description = BINARY 'Quan tri vien toan he thong';
UPDATE roles SET description = 'Kiểm duyệt nội dung và xử lý báo cáo'
WHERE id = 2 AND BINARY description = BINARY 'Kiem duyet noi dung va xu ly bao cao';
UPDATE roles SET description = 'Giảng viên tạo và quản lý khóa học'
WHERE id = 3 AND BINARY description = BINARY 'Giang vien tao va quan ly khoa hoc';
UPDATE roles SET description = 'Học viên tham gia khóa học'
WHERE id = 4 AND BINARY description = BINARY 'Hoc vien tham gia khoa hoc';

-- permissions
UPDATE permissions SET name = 'Xem danh sách người dùng'
WHERE id = 1 AND BINARY name = BINARY 'Xem danh sach nguoi dung';
UPDATE permissions SET name = 'Tạo tài khoản người dùng'
WHERE id = 2 AND BINARY name = BINARY 'Tao tai khoan nguoi dung';
UPDATE permissions SET name = 'Cập nhật thông tin người dùng'
WHERE id = 3 AND BINARY name = BINARY 'Cap nhat thong tin nguoi dung';
UPDATE permissions SET name = 'Khóa tài khoản người dùng'
WHERE id = 4 AND BINARY name = BINARY 'Khoa tai khoan nguoi dung';
UPDATE permissions SET name = 'Xem khóa học'
WHERE id = 5 AND BINARY name = BINARY 'Xem khoa hoc';
UPDATE permissions SET name = 'Tạo khóa học'
WHERE id = 6 AND BINARY name = BINARY 'Tao khoa hoc';
UPDATE permissions SET name = 'Cập nhật khóa học'
WHERE id = 7 AND BINARY name = BINARY 'Cap nhat khoa hoc';
UPDATE permissions SET name = 'Xóa khóa học'
WHERE id = 8 AND BINARY name = BINARY 'Xoa khoa hoc';
UPDATE permissions SET name = 'Tạo bài học'
WHERE id = 9 AND BINARY name = BINARY 'Tao bai hoc';
UPDATE permissions SET name = 'Tạo bài kiểm tra'
WHERE id = 10 AND BINARY name = BINARY 'Tao bai kiem tra';
UPDATE permissions SET name = 'Xem giao dịch thanh toán'
WHERE id = 11 AND BINARY name = BINARY 'Xem giao dich thanh toan';
UPDATE permissions SET name = 'Xem báo cáo vi phạm'
WHERE id = 12 AND BINARY name = BINARY 'Xem bao cao vi pham';
UPDATE permissions SET name = 'Xem dashboard quản trị'
WHERE id = 13 AND BINARY name = BINARY 'Xem dashboard quan tri';
UPDATE permissions SET name = 'Xem nhật ký hệ thống'
WHERE id = 14 AND BINARY name = BINARY 'Xem nhat ky he thong';

-- categories
UPDATE categories SET name = 'Tiếng Trung giao tiếp'
WHERE id = 1 AND BINARY name = BINARY 'Tieng Trung giao tiep';
UPDATE categories SET name = 'Luyện thi HSK'
WHERE id = 2 AND BINARY name = BINARY 'Luyen thi HSK';
UPDATE categories SET name = 'Tiếng Trung thương mại'
WHERE id = 3 AND BINARY name = BINARY 'Tieng Trung thuong mai';
UPDATE categories SET name = 'Tiếng Trung cho công việc'
WHERE id = 4 AND BINARY name = BINARY 'Tieng Trung cho cong viec';
UPDATE categories SET name = 'Ngữ pháp và từ vựng'
WHERE id = 5 AND BINARY name = BINARY 'Ngu phap va tu vung';
UPDATE categories SET name = 'Phát âm và nghe nói'
WHERE id = 6 AND BINARY name = BINARY 'Phat am va nghe noi';

-- tags
UPDATE tags SET name = 'Giao tiếp'
WHERE id = 4 AND BINARY name = BINARY 'Giao tiep';
UPDATE tags SET name = 'Nghe hiểu'
WHERE id = 5 AND BINARY name = BINARY 'Nghe hieu';
UPDATE tags SET name = 'Thương mại'
WHERE id = 6 AND BINARY name = BINARY 'Thuong mai';
UPDATE tags SET name = 'Viết chữ Hán'
WHERE id = 7 AND BINARY name = BINARY 'Viet chu Han';
UPDATE tags SET name = 'Từ vựng công xưởng'
WHERE id = 8 AND BINARY name = BINARY 'Tu vung cong xuong';

-- users
UPDATE users SET full_name = 'Nguyễn Minh Quân'
WHERE id = 1 AND BINARY full_name = BINARY 'Nguyen Minh Quan';
UPDATE users SET full_name = 'Trần Thu Hà'
WHERE id = 2 AND BINARY full_name = BINARY 'Tran Thu Ha';
UPDATE users SET full_name = 'Lê Anh Tuấn'
WHERE id = 3 AND BINARY full_name = BINARY 'Le Anh Tuan';
UPDATE users SET full_name = 'Phạm Linh Chi'
WHERE id = 4 AND BINARY full_name = BINARY 'Pham Linh Chi';
UPDATE users SET full_name = 'Hoàng Đức Huy'
WHERE id = 5 AND BINARY full_name = BINARY 'Hoang Duc Huy';
UPDATE users SET full_name = 'Đặng Ngọc Mai'
WHERE id = 6 AND BINARY full_name = BINARY 'Dang Ngoc Mai';
UPDATE users SET full_name = 'Bùi Khánh Linh'
WHERE id = 7 AND BINARY full_name = BINARY 'Bui Khanh Linh';
UPDATE users SET full_name = 'Võ Thành Nam'
WHERE id = 8 AND BINARY full_name = BINARY 'Vo Thanh Nam';
UPDATE users SET full_name = 'Đỗ Mỹ Duyên'
WHERE id = 9 AND BINARY full_name = BINARY 'Do My Duyen';
UPDATE users SET full_name = 'Mai Quốc Bảo'
WHERE id = 10 AND BINARY full_name = BINARY 'Mai Quoc Bao';
UPDATE users SET full_name = 'Phan Tường Vy'
WHERE id = 11 AND BINARY full_name = BINARY 'Phan Tuong Vy';
UPDATE users SET full_name = 'Ngô Gia Phúc'
WHERE id = 12 AND BINARY full_name = BINARY 'Ngo Gia Phuc';
UPDATE users SET full_name = 'Trịnh Minh Anh'
WHERE id = 13 AND BINARY full_name = BINARY 'Trinh Minh Anh';
UPDATE users SET full_name = 'Cao Hoài An'
WHERE id = 14 AND BINARY full_name = BINARY 'Cao Hoai An';
UPDATE users SET full_name = 'Lâm Nhật Minh'
WHERE id = 15 AND BINARY full_name = BINARY 'Lam Nhat Minh';

-- courses
UPDATE courses SET description = 'Học chào hỏi, giới thiệu bản thân, hỏi đường và các mẫu câu hằng ngày.'
WHERE id = 1 AND BINARY description = BINARY 'Hoc chao hoi, gioi thieu ban than, hoi duong va cac mau cau hang ngay.';
UPDATE courses SET title = 'HSK 1 từ con số 0'
WHERE id = 2 AND BINARY title = BINARY 'HSK 1 tu con so 0';
UPDATE courses SET description = 'Lộ trình HSK 1 với 150 từ vựng, ngữ pháp nền tảng và đề luyện tập.'
WHERE id = 2 AND BINARY description = BINARY 'Lo trinh HSK 1 voi 150 tu vung, ngu phap nen tang va de luyen tap.';
UPDATE courses SET title = 'HSK 2 cấp tốc'
WHERE id = 3 AND BINARY title = BINARY 'HSK 2 cap toc';
UPDATE courses SET description = 'Ôn tập từ vựng HSK 2, nghe hiểu và đọc hiểu theo cấu trúc đề thi.'
WHERE id = 3 AND BINARY description = BINARY 'On tap tu vung HSK 2, nghe hieu va doc hieu theo cau truc de thi.';
UPDATE courses SET title = 'Tiếng Trung cho công nhân nhà máy'
WHERE id = 4 AND BINARY title = BINARY 'Tieng Trung cho cong nhan nha may';
UPDATE courses SET description = 'Từ vựng an toàn lao động, ca kíp, máy móc và trao đổi với quản lý Trung Quốc.'
WHERE id = 4 AND BINARY description = BINARY 'Tu vung an toan lao dong, ca kip, may moc va trao doi voi quan ly Trung Quoc.';
UPDATE courses SET title = 'Tiếng Trung thương mại ứng dụng'
WHERE id = 5 AND BINARY title = BINARY 'Tieng Trung thuong mai ung dung';
UPDATE courses SET description = 'Hội họp, email, báo giá, đàm phán và chăm sóc khách hàng bằng tiếng Trung.'
WHERE id = 5 AND BINARY description = BINARY 'Hoi hop, email, bao gia, dam phan va cham soc khach hang bang tieng Trung.';
UPDATE courses SET title = 'Phát âm Pinyin chuẩn ngay từ đầu'
WHERE id = 6 AND BINARY title = BINARY 'Phat am Pinyin chuan ngay tu dau';
UPDATE courses SET description = 'Luyện thanh mẫu, vận mẫu, thanh điệu và sửa lỗi phát âm phổ biến.'
WHERE id = 6 AND BINARY description = BINARY 'Luyen thanh mau, van mau, thanh dieu va sua loi phat am pho bien.';
UPDATE courses SET title = 'Ngữ pháp tiếng Trung cho người mới'
WHERE id = 7 AND BINARY title = BINARY 'Ngu phap tieng Trung cho nguoi moi';
UPDATE courses SET description = 'Giải thích các mẫu câu cơ bản với ví dụ thực tế trong giao tiếp.'
WHERE id = 7 AND BINARY description = BINARY 'Giai thich cac mau cau co ban voi vi du thuc te trong giao tiep.';
UPDATE courses SET title = 'Nghe nói tiếng Trung mỗi ngày'
WHERE id = 8 AND BINARY title = BINARY 'Nghe noi tieng Trung moi ngay';
UPDATE courses SET description = 'Bài nghe ngắn theo chủ đề và bài tập phản xạ hội thoại.'
WHERE id = 8 AND BINARY description = BINARY 'Bai nghe ngan theo chu de va bai tap phan xa hoi thoai.';

-- chapters
UPDATE chapters SET title = 'HSK 1: Mẫu câu cơ bản'
WHERE id = 4 AND BINARY title = BINARY 'HSK 1: Mau cau co ban';
UPDATE chapters SET title = 'HSK 2: Mở rộng từ vựng'
WHERE id = 5 AND BINARY title = BINARY 'HSK 2: Mo rong tu vung';
UPDATE chapters SET title = 'HSK 2: Luyện đề nghe đọc'
WHERE id = 6 AND BINARY title = BINARY 'HSK 2: Luyen de nghe doc';
UPDATE chapters SET title = 'Từ vựng nhà máy và an toàn'
WHERE id = 7 AND BINARY title = BINARY 'Tu vung nha may va an toan';
UPDATE chapters SET title = 'Giao tiếp trong ca làm'
WHERE id = 8 AND BINARY title = BINARY 'Giao tiep trong ca lam';
UPDATE chapters SET title = 'Thương mại: Giới thiệu công ty'
WHERE id = 9 AND BINARY title = BINARY 'Thuong mai: Gioi thieu cong ty';
UPDATE chapters SET title = 'Thương mại: Báo giá và đàm phán'
WHERE id = 10 AND BINARY title = BINARY 'Thuong mai: Bao gia va dam phan';
UPDATE chapters SET title = 'Pinyin: Thanh mẫu và vận mẫu'
WHERE id = 11 AND BINARY title = BINARY 'Pinyin: Thanh mau va van mau';
UPDATE chapters SET title = 'Pinyin: Thanh điệu và biến điệu'
WHERE id = 12 AND BINARY title = BINARY 'Pinyin: Thanh dieu va bien dieu';
UPDATE chapters SET title = 'Ngữ pháp nền tảng'
WHERE id = 13 AND BINARY title = BINARY 'Ngu phap nen tang';
UPDATE chapters SET title = 'Mẫu câu thường dùng'
WHERE id = 14 AND BINARY title = BINARY 'Mau cau thuong dung';
UPDATE chapters SET title = 'Nghe nói chủ đề sinh hoạt'
WHERE id = 15 AND BINARY title = BINARY 'Nghe noi chu de sinh hoat';
UPDATE chapters SET title = 'Phản xạ hội thoại ngắn'
WHERE id = 16 AND BINARY title = BINARY 'Phan xa hoi thoai ngan';

-- lessons
UPDATE lessons SET title = 'Số đếm, ngày tháng và thời gian'
WHERE id = 6 AND BINARY title = BINARY 'So dem, ngay thang va thoi gian';
UPDATE lessons SET title = 'Câu hỏi với ma, shei, shenme'
WHERE id = 7 AND BINARY title = BINARY 'Cau hoi voi ma, shei, shenme';
UPDATE lessons SET title = 'Đọc đoạn văn HSK 1 ngắn'
WHERE id = 8 AND BINARY title = BINARY 'Doc doan van HSK 1 ngan';
UPDATE lessons SET title = 'Từ vựng HSK 2 theo chủ đề mua sắm'
WHERE id = 9 AND BINARY title = BINARY 'Tu vung HSK 2 theo chu de mua sam';
UPDATE lessons SET title = 'Câu so sánh và bổ ngữ kết quả'
WHERE id = 10 AND BINARY title = BINARY 'Cau so sanh va bo ngu ket qua';
UPDATE lessons SET title = 'Nghe hiểu HSK 2 phần tranh ảnh'
WHERE id = 11 AND BINARY title = BINARY 'Nghe hieu HSK 2 phan tranh anh';
UPDATE lessons SET title = 'Đọc hiểu HSK 2 phần điền từ'
WHERE id = 12 AND BINARY title = BINARY 'Doc hieu HSK 2 phan dien tu';
UPDATE lessons SET title = 'Từ vựng bảo hộ lao động'
WHERE id = 13 AND BINARY title = BINARY 'Tu vung bao ho lao dong';
UPDATE lessons SET title = 'Lệnh thao tác máy móc cơ bản'
WHERE id = 14 AND BINARY title = BINARY 'Lenh thao tac may moc co ban';
UPDATE lessons SET title = 'Báo cáo sự cố trong ca làm'
WHERE id = 15 AND BINARY title = BINARY 'Bao cao su co trong ca lam';
UPDATE lessons SET title = 'Xin nghỉ và đổi ca bằng tiếng Trung'
WHERE id = 16 AND BINARY title = BINARY 'Xin nghi va doi ca bang tieng Trung';
UPDATE lessons SET title = 'Giới thiệu công ty và phòng ban'
WHERE id = 17 AND BINARY title = BINARY 'Gioi thieu cong ty va phong ban';
UPDATE lessons SET title = 'Viết email hẹn lịch họp'
WHERE id = 18 AND BINARY title = BINARY 'Viet email hen lich hop';
UPDATE lessons SET title = 'Từ vựng báo giá và hợp đồng'
WHERE id = 19 AND BINARY title = BINARY 'Tu vung bao gia va hop dong';
UPDATE lessons SET title = 'Đàm phán điều khoản giao hàng'
WHERE id = 20 AND BINARY title = BINARY 'Dam phan dieu khoan giao hang';
UPDATE lessons SET title = 'Thanh mẫu b p m f và vận mẫu đơn'
WHERE id = 21 AND BINARY title = BINARY 'Thanh mau b p m f va van mau don';
UPDATE lessons SET title = 'Luyện ghép âm và đọc âm tiết'
WHERE id = 22 AND BINARY title = BINARY 'Luyen ghep am va doc am tiet';
UPDATE lessons SET title = 'Bốn thanh điệu cơ bản'
WHERE id = 23 AND BINARY title = BINARY 'Bon thanh dieu co ban';
UPDATE lessons SET title = 'Biến điệu của yi, bu và thanh ba'
WHERE id = 24 AND BINARY title = BINARY 'Bien dieu cua yi, bu va thanh ba';
UPDATE lessons SET title = 'Câu chủ vị và câu vị ngữ tính từ'
WHERE id = 25 AND BINARY title = BINARY 'Cau chu vi va cau vi ngu tinh tu';
UPDATE lessons SET title = 'Cách dùng de và le'
WHERE id = 26 AND BINARY title = BINARY 'Cach dung de va le';
UPDATE lessons SET title = 'Mẫu câu yao, xiang, neng'
WHERE id = 27 AND BINARY title = BINARY 'Mau cau yao, xiang, neng';
UPDATE lessons SET title = 'Câu liên động trong sinh hoạt'
WHERE id = 28 AND BINARY title = BINARY 'Cau lien dong trong sinh hoat';
UPDATE lessons SET title = 'Nghe chủ đề ăn uống'
WHERE id = 29 AND BINARY title = BINARY 'Nghe chu de an uong';
UPDATE lessons SET title = 'Nghe chủ đề mua sắm'
WHERE id = 30 AND BINARY title = BINARY 'Nghe chu de mua sam';
UPDATE lessons SET title = 'Hội thoại tại ga tàu điện'
WHERE id = 31 AND BINARY title = BINARY 'Hoi thoai tai ga tau dien';
UPDATE lessons SET title = 'Phản xạ đặt món tại nhà hàng'
WHERE id = 32 AND BINARY title = BINARY 'Phan xa dat mon tai nha hang';

-- lesson_documents
UPDATE lesson_documents SET title = 'Bảng Pinyin và cách đọc'
WHERE id = 1 AND BINARY title = BINARY 'Bang Pinyin va cach doc';
UPDATE lesson_documents SET title = 'Mẫu câu chào hỏi cơ bản'
WHERE id = 2 AND BINARY title = BINARY 'Mau cau chao hoi co ban';
UPDATE lesson_documents SET title = 'Bảng số đếm và ngày tháng'
WHERE id = 3 AND BINARY title = BINARY 'Bang so dem va ngay thang';
UPDATE lesson_documents SET title = 'Từ vựng an toàn lao động'
WHERE id = 5 AND BINARY title = BINARY 'Tu vung an toan lao dong';
UPDATE lesson_documents SET title = 'Mẫu email thương mại'
WHERE id = 6 AND BINARY title = BINARY 'Mau email thuong mai';
UPDATE lesson_documents SET title = 'Bảng luyện thanh điệu'
WHERE id = 7 AND BINARY title = BINARY 'Bang luyen thanh dieu';
UPDATE lesson_documents SET title = 'Transcript nghe chủ đề ăn uống'
WHERE id = 8 AND BINARY title = BINARY 'Transcript nghe chu de an uong';

-- quizzes
UPDATE quizzes SET title = 'Điền từ vựng số đếm'
WHERE id = 3 AND BINARY title = BINARY 'Dien tu vung so dem';
UPDATE quizzes SET title = 'Nối từ HSK 1'
WHERE id = 4 AND BINARY title = BINARY 'Noi tu HSK 1';
UPDATE quizzes SET title = 'Nghe hiểu HSK 2 tranh ảnh'
WHERE id = 5 AND BINARY title = BINARY 'Nghe hieu HSK 2 tranh anh';
UPDATE quizzes SET title = 'Đề mô phỏng HSK 1'
WHERE id = 6 AND BINARY title = BINARY 'De mo phong HSK 1';
UPDATE quizzes SET title = 'Quiz từ vựng nhà máy'
WHERE id = 7 AND BINARY title = BINARY 'Quiz tu vung nha may';
UPDATE quizzes SET title = 'Quiz báo cáo sự cố'
WHERE id = 8 AND BINARY title = BINARY 'Quiz bao cao su co';
UPDATE quizzes SET title = 'Quiz email thương mại'
WHERE id = 9 AND BINARY title = BINARY 'Quiz email thuong mai';
UPDATE quizzes SET title = 'Nối cặp thanh điệu Pinyin'
WHERE id = 10 AND BINARY title = BINARY 'Noi cap thanh dieu Pinyin';
UPDATE quizzes SET title = 'Quiz nghe chủ đề ăn uống'
WHERE id = 11 AND BINARY title = BINARY 'Quiz nghe chu de an uong';
UPDATE quizzes SET title = 'Quiz phản xạ đặt món'
WHERE id = 12 AND BINARY title = BINARY 'Quiz phan xa dat mon';

-- questions
UPDATE questions SET content = 'Điền pinyin cho số 8: ___'
WHERE id = 5 AND BINARY content = BINARY 'Dien pinyin cho so 8: ___';
UPDATE questions SET content = 'Điền tiếng Trung pinyin cho "hôm nay": ___'
WHERE id = 6 AND BINARY content = BINARY 'Dien tieng Trung pinyin cho "hom nay": ___';
UPDATE questions SET content = 'Nối từ tiếng Trung với nghĩa tiếng Việt tương ứng.'
WHERE id = 7 AND BINARY content = BINARY 'Noi tu tieng Trung voi nghia tieng Viet tuong ung.';
UPDATE questions SET content = 'Nối cụm từ hỏi đáp HSK 1 với chức năng giao tiếp.'
WHERE id = 8 AND BINARY content = BINARY 'Noi cum tu hoi dap HSK 1 voi chuc nang giao tiep.';
UPDATE questions SET content = 'Nghe audio và chọn nội dung người nói muốn mua.'
WHERE id = 9 AND BINARY content = BINARY 'Nghe audio va chon noi dung nguoi noi muon mua.';
UPDATE questions SET content = 'Nghe audio và chọn thời gian hẹn gặp.'
WHERE id = 10 AND BINARY content = BINARY 'Nghe audio va chon thoi gian hen gap.';
UPDATE questions SET content = 'Trong HSK 1, "wo" nghĩa là gì?'
WHERE id = 11 AND BINARY content = BINARY 'Trong HSK 1, "wo" nghia la gi?';
UPDATE questions SET content = 'Chọn câu đúng để hỏi "bạn là ai?"'
WHERE id = 12 AND BINARY content = BINARY 'Chon cau dung de hoi "ban la ai?"';
UPDATE questions SET content = 'An toàn lao động trong tiếng Trung thường nói là gì?'
WHERE id = 13 AND BINARY content = BINARY 'An toan lao dong trong tieng Trung thuong noi la gi?';
UPDATE questions SET content = 'Từ nào liên quan đến "máy móc"?'
WHERE id = 14 AND BINARY content = BINARY 'Tu nao lien quan den "may moc"?';
UPDATE questions SET content = 'Nghe audio và chọn sự cố được báo cáo.'
WHERE id = 15 AND BINARY content = BINARY 'Nghe audio va chon su co duoc bao cao.';
UPDATE questions SET content = 'Nghe audio và chọn hành động cần làm tiếp theo.'
WHERE id = 16 AND BINARY content = BINARY 'Nghe audio va chon hanh dong can lam tiep theo.';
UPDATE questions SET content = 'Điền từ còn thiếu trong câu email: Qing ___ huiyi shijian.'
WHERE id = 17 AND BINARY content = BINARY 'Dien tu con thieu trong cau email: Qing ___ huiyi shijian.';
UPDATE questions SET content = 'Điền từ phù hợp: Wo xiang ___ yixia baojia.'
WHERE id = 18 AND BINARY content = BINARY 'Dien tu phu hop: Wo xiang ___ yixia baojia.';
UPDATE questions SET content = 'Nối thanh điệu với ký hiệu đúng.'
WHERE id = 19 AND BINARY content = BINARY 'Noi thanh dieu voi ky hieu dung.';
UPDATE questions SET content = 'Nối biến điệu với ví dụ đúng.'
WHERE id = 20 AND BINARY content = BINARY 'Noi bien dieu voi vi du dung.';
UPDATE questions SET content = 'Nghe audio và chọn món ăn được gọi.'
WHERE id = 21 AND BINARY content = BINARY 'Nghe audio va chon mon an duoc goi.';
UPDATE questions SET content = 'Nghe audio và chọn đồ uống được nhắc đến.'
WHERE id = 22 AND BINARY content = BINARY 'Nghe audio va chon do uong duoc nhac den.';
UPDATE questions SET content = 'Những câu nào dùng khi gọi món?'
WHERE id = 23 AND BINARY content = BINARY 'Nhung cau nao dung khi goi mon?';
UPDATE questions SET content = 'Những câu nào dùng để yêu cầu thanh toán?'
WHERE id = 24 AND BINARY content = BINARY 'Nhung cau nao dung de yeu cau thanh toan?';

-- answers
UPDATE answers SET matching_pair = 'học tập'
WHERE id = 17 AND BINARY matching_pair = BINARY 'hoc tap';
UPDATE answers SET matching_pair = 'giáo viên'
WHERE id = 18 AND BINARY matching_pair = BINARY 'giao vien';
UPDATE answers SET matching_pair = 'bạn bè'
WHERE id = 19 AND BINARY matching_pair = BINARY 'ban be';
UPDATE answers SET matching_pair = 'hỏi thăm sức khỏe'
WHERE id = 20 AND BINARY matching_pair = BINARY 'hoi tham suc khoe';
UPDATE answers SET matching_pair = 'hỏi tên'
WHERE id = 21 AND BINARY matching_pair = BINARY 'hoi ten';
UPDATE answers SET matching_pair = 'hỏi giá tiền'
WHERE id = 22 AND BINARY matching_pair = BINARY 'hoi gia tien';
UPDATE answers SET content = 'Một chiếc áo sơ mi'
WHERE id = 23 AND BINARY content = BINARY 'Mot chiec ao so mi';
UPDATE answers SET content = 'Một vé tàu'
WHERE id = 24 AND BINARY content = BINARY 'Mot ve tau';
UPDATE answers SET content = 'Một quyển sách'
WHERE id = 25 AND BINARY content = BINARY 'Mot quyen sach';
UPDATE answers SET content = '3 giờ chiều'
WHERE id = 26 AND BINARY content = BINARY '3 gio chieu';
UPDATE answers SET content = '8 giờ sáng'
WHERE id = 27 AND BINARY content = BINARY '8 gio sang';
UPDATE answers SET content = '9 giờ tối'
WHERE id = 28 AND BINARY content = BINARY '9 gio toi';
UPDATE answers SET content = 'Tôi'
WHERE id = 29 AND BINARY content = BINARY 'Toi';
UPDATE answers SET content = 'Bạn'
WHERE id = 30 AND BINARY content = BINARY 'Ban';
UPDATE answers SET content = 'Thầy giáo'
WHERE id = 31 AND BINARY content = BINARY 'Thay giao';
UPDATE answers SET content = 'Dây chuyền dừng đột ngột'
WHERE id = 39 AND BINARY content = BINARY 'Day chuyen dung dot ngot';
UPDATE answers SET content = 'Khách hàng hủy đơn'
WHERE id = 40 AND BINARY content = BINARY 'Khach hang huy don';
UPDATE answers SET content = 'Báo ngay cho tổ trưởng'
WHERE id = 41 AND BINARY content = BINARY 'Bao ngay cho to truong';
UPDATE answers SET content = 'Tự ý khởi động lại máy'
WHERE id = 42 AND BINARY content = BINARY 'Tu y khoi dong lai may';
UPDATE answers SET matching_pair = 'đổi thanh 2'
WHERE id = 50 AND BINARY matching_pair = BINARY 'doi thanh 2';
UPDATE answers SET matching_pair = 'đổi thanh 2'
WHERE id = 51 AND BINARY matching_pair = BINARY 'doi thanh 2';
UPDATE answers SET content = 'hai thanh 3 liên tiếp'
WHERE id = 52 AND BINARY content = BINARY 'hai thanh 3 lien tiep';
UPDATE answers SET matching_pair = 'thanh 3 đầu đổi thanh 2'
WHERE id = 52 AND BINARY matching_pair = BINARY 'thanh 3 dau doi thanh 2';

-- assignments
UPDATE assignments SET title = 'Viết đoạn hội thoại chào hỏi'
WHERE id = 1 AND BINARY title = BINARY 'Viet doan hoi thoai chao hoi';
UPDATE assignments SET description = 'Viết đoạn hội thoại 6 câu về chào hỏi và giới thiệu tên.'
WHERE id = 1 AND BINARY description = BINARY 'Viet doan hoi thoai 6 cau ve chao hoi va gioi thieu ten.';
UPDATE assignments SET title = 'Luyện viết số đếm và ngày tháng'
WHERE id = 2 AND BINARY title = BINARY 'Luyen viet so dem va ngay thang';
UPDATE assignments SET description = 'Viết 10 câu có số đếm, ngày tháng và giờ hẹn.'
WHERE id = 2 AND BINARY description = BINARY 'Viet 10 cau co so dem, ngay thang va gio hen.';
UPDATE assignments SET title = 'Tóm tắt bài nghe HSK 2'
WHERE id = 3 AND BINARY title = BINARY 'Tom tat bai nghe HSK 2';
UPDATE assignments SET description = 'Nghe file audio và viết tóm tắt nội dung bằng tiếng Việt.'
WHERE id = 3 AND BINARY description = BINARY 'Nghe file audio va viet tom tat noi dung bang tieng Viet.';
UPDATE assignments SET title = 'Báo cáo sự cố nhà máy'
WHERE id = 4 AND BINARY title = BINARY 'Bao cao su co nha may';
UPDATE assignments SET description = 'Viết mẫu báo cáo sự cố ngắn dùng từ vựng đã học.'
WHERE id = 4 AND BINARY description = BINARY 'Viet mau bao cao su co ngan dung tu vung da hoc.';
UPDATE assignments SET title = 'Viết email hẹn lịch họp'
WHERE id = 5 AND BINARY title = BINARY 'Viet email hen lich hop';
UPDATE assignments SET description = 'Soạn email tiếng Trung hẹn lịch họp với đối tác.'
WHERE id = 5 AND BINARY description = BINARY 'Soan email tieng Trung hen lich hop voi doi tac.';
UPDATE assignments SET title = 'Ghi âm hội thoại đặt món'
WHERE id = 6 AND BINARY title = BINARY 'Ghi am hoi thoai dat mon';
UPDATE assignments SET description = 'Nộp file ghi âm hội thoại đặt món tại nhà hàng.'
WHERE id = 6 AND BINARY description = BINARY 'Nop file ghi am hoi thoai dat mon tai nha hang.';

-- assignment_submissions
UPDATE assignment_submissions SET teacher_feedback = 'Hội thoại tự nhiên, cần chú ý thanh điệu câu chào.'
WHERE id = 1 AND BINARY teacher_feedback = BINARY 'Hoi thoai tu nhien, can chu y thanh dieu cau chao.';
UPDATE assignment_submissions SET teacher_feedback = 'Dùng từ vựng tốt, thêm chữ Hán nếu có thể.'
WHERE id = 2 AND BINARY teacher_feedback = BINARY 'Dung tu vung tot, them chu Han neu co the.';
UPDATE assignment_submissions SET submission_text = 'Bài nghe nói về mua sắm quần áo và hỏi giá.'
WHERE id = 3 AND BINARY submission_text = BINARY 'Bai nghe noi ve mua sam quan ao va hoi gia.';
UPDATE assignment_submissions SET submission_text = 'Máy số 3 dừng đột ngột, tôi đã báo tổ trưởng và tắt nguồn.'
WHERE id = 4 AND BINARY submission_text = BINARY 'May so 3 dung dot ngot, toi da bao to truong va tat nguon.';
UPDATE assignment_submissions SET teacher_feedback = 'Bổ sung thời gian xảy ra sự cố và hành động an toàn.'
WHERE id = 4 AND BINARY teacher_feedback = BINARY 'Bo sung thoi gian xay ra su co va hanh dong an toan.';
UPDATE assignment_submissions SET submission_text = 'Ghi âm hội thoại đặt món mì và trà xanh.'
WHERE id = 5 AND BINARY submission_text = BINARY 'Ghi am hoi thoai dat mon mi va tra xanh.';
UPDATE assignment_submissions SET teacher_feedback = 'Phản xạ tốt, phát âm rõ.'
WHERE id = 5 AND BINARY teacher_feedback = BINARY 'Phan xa tot, phat am ro.';

-- refunds
UPDATE refunds SET reason = 'Học viên yêu cầu hoàn tiền do trùng lịch làm việc.'
WHERE id = 1 AND BINARY reason = BINARY 'Hoc vien yeu cau hoan tien do trung lich lam viec.';
UPDATE refunds SET reason = 'Yêu cầu hoàn tiền không đáp ứng điều kiện chính sách.'
WHERE id = 2 AND BINARY reason = BINARY 'Yeu cau hoan tien khong dap ung dieu kien chinh sach.';
UPDATE refunds SET reason = 'Lỗi truy cập tạm thời trong ngày khai giảng.'
WHERE id = 3 AND BINARY reason = BINARY 'Loi truy cap tam thoi trong ngay khai giang.';
UPDATE refunds SET reason = 'Cần xem xét ưu đãi bổ sung cho học viên giới thiệu bạn bè.'
WHERE id = 4 AND BINARY reason = BINARY 'Can xem xet uu dai bo sung cho hoc vien gioi thieu ban be.';

-- notifications
UPDATE notifications SET title = 'Chúc mừng hoàn thành khóa học'
WHERE id = 1 AND BINARY title = BINARY 'Chuc mung hoan thanh khoa hoc';
UPDATE notifications SET content = 'Bạn đã hoàn thành khóa Tiếng Trung giao tiếp cơ bản và nhận chứng chỉ.'
WHERE id = 1 AND BINARY content = BINARY 'Ban da hoan thanh khoa Tieng Trung giao tiep co ban va nhan chung chi.';
UPDATE notifications SET title = 'Thanh toán thành công'
WHERE id = 2 AND BINARY title = BINARY 'Thanh toan thanh cong';
UPDATE notifications SET content = 'Quyền truy cập khóa HSK 2 cấp tốc của bạn đã được kích hoạt.'
WHERE id = 2 AND BINARY content = BINARY 'Quyen truy cap khoa HSK 2 cap toc cua ban da duoc kich hoat.';
UPDATE notifications SET title = 'Điểm quiz rất tốt'
WHERE id = 3 AND BINARY title = BINARY 'Diem quiz rat tot';
UPDATE notifications SET content = 'Bạn đạt 100 điểm trong bài Điền từ vựng số đếm.'
WHERE id = 3 AND BINARY content = BINARY 'Ban dat 100 diem trong bai Dien tu vung so dem.';
UPDATE notifications SET title = 'Bài nộp cần chỉnh sửa'
WHERE id = 4 AND BINARY title = BINARY 'Bai nop can chinh sua';
UPDATE notifications SET content = 'Giảng viên đã yêu cầu bổ sung nội dung cho bài Báo cáo sự cố nhà máy.'
WHERE id = 4 AND BINARY content = BINARY 'Giang vien da yeu cau bo sung noi dung cho bai Bao cao su co nha may.';
UPDATE notifications SET title = 'Cập nhật khóa học'
WHERE id = 5 AND BINARY title = BINARY 'Cap nhat khoa hoc';
UPDATE notifications SET content = 'Khóa Nghe nói tiếng Trung mỗi ngày vừa có nội dung mới.'
WHERE id = 5 AND BINARY content = BINARY 'Khoa Nghe noi tieng Trung moi ngay vua co noi dung moi.';

-- reports
UPDATE reports SET reason = 'Mô tả khóa học chưa nêu rõ lịch cập nhật bài giảng.'
WHERE id = 1 AND BINARY reason = BINARY 'Mo ta khoa hoc chua neu ro lich cap nhat bai giang.';
UPDATE reports SET reason = 'Tin nhắn bình luận có dấu hiệu spam trong Q&A.'
WHERE id = 2 AND BINARY reason = BINARY 'Tin nhan binh luan co dau hieu spam trong Q&A.';
UPDATE reports SET reason = 'Câu hỏi trùng lặp nhiều lần trong bài học.'
WHERE id = 3 AND BINARY reason = BINARY 'Cau hoi trung lap nhieu lan trong bai hoc.';
UPDATE reports SET reason = 'Review có nội dung không liên quan đến khóa học.'
WHERE id = 4 AND BINARY reason = BINARY 'Review co noi dung khong lien quan den khoa hoc.';

-- badges
UPDATE badges SET name = 'Người mới chăm chỉ'
WHERE id = 1 AND BINARY name = BINARY 'Nguoi moi cham chi';
UPDATE badges SET description = 'Hoàn thành 5 bài học đầu tiên.'
WHERE id = 1 AND BINARY description = BINARY 'Hoan thanh 5 bai hoc dau tien.';
UPDATE badges SET name = 'Chinh phục quiz đầu tiên'
WHERE id = 2 AND BINARY name = BINARY 'Chinh phuc quiz dau tien';
UPDATE badges SET description = 'Đạt điểm qua 3 bài quiz.'
WHERE id = 2 AND BINARY description = BINARY 'Dat diem qua 3 bai quiz.';
UPDATE badges SET name = 'Chuỗi 7 ngày'
WHERE id = 3 AND BINARY name = BINARY 'Chuoi 7 ngay';
UPDATE badges SET description = 'Học liên tiếp 7 ngày.'
WHERE id = 3 AND BINARY description = BINARY 'Hoc lien tiep 7 ngay.';
UPDATE badges SET name = 'Vượt mốc HSK 1'
WHERE id = 4 AND BINARY name = BINARY 'Vuot moc HSK 1';
UPDATE badges SET description = 'Hoàn thành đề mô phỏng HSK 1.'
WHERE id = 4 AND BINARY description = BINARY 'Hoan thanh de mo phong HSK 1.';

-- course_reviews
UPDATE course_reviews SET comment = 'Bài giảng dễ hiểu, phần chào hỏi áp dụng được ngay trong công việc.'
WHERE id = 1 AND BINARY comment = BINARY 'Bai giang de hieu, phan chao hoi ap dung duoc ngay trong cong viec.';
UPDATE course_reviews SET comment = 'Nội dung tốt, mong có thêm bài nghe chậm hơn cho người mới.'
WHERE id = 2 AND BINARY comment = BINARY 'Noi dung tot, mong co them bai nghe cham hon cho nguoi moi.';
UPDATE course_reviews SET comment = 'Lộ trình HSK 1 rõ ràng, quiz sát với từ vựng đã học.'
WHERE id = 3 AND BINARY comment = BINARY 'Lo trinh HSK 1 ro rang, quiz sat voi tu vung da hoc.';
UPDATE course_reviews SET comment = 'Từ vựng nhà máy thực tế, phù hợp với người đi làm theo ca.'
WHERE id = 4 AND BINARY comment = BINARY 'Tu vung nha may thuc te, phu hop voi nguoi di lam theo ca.';
UPDATE course_reviews SET comment = 'Bài nghe ngắn nhưng rất hiệu quả để luyện phản xạ.'
WHERE id = 5 AND BINARY comment = BINARY 'Bai nghe ngan nhung rat hieu qua de luyen phan xa.';

-- lesson_qa
UPDATE lesson_qa SET content = 'Em hay nhầm thanh 2 và thanh 3, có cách luyện nào nhanh hơn không?'
WHERE id = 1 AND BINARY content = BINARY 'Em hay nham thanh 2 va thanh 3, co cach luyen nao nhanh hon khong?';
UPDATE lesson_qa SET content = 'Em hãy đọc cặp từ ma2 - ma3 chậm lại và ghi âm so sánh mỗi ngày 5 phút.'
WHERE id = 2 AND BINARY content = BINARY 'Em hay doc cap tu ma2 - ma3 cham lai va ghi am so sanh moi ngay 5 phut.';
UPDATE lesson_qa SET content = 'Khi nói ngày tháng có cần thêm hao sau ngày không ạ?'
WHERE id = 3 AND BINARY content = BINARY 'Khi noi ngay thang co can them hao sau ngay khong a?';
UPDATE lesson_qa SET content = 'Có, khi nói ngày trong tháng em dùng hao, ví dụ san yue ba hao.'
WHERE id = 4 AND BINARY content = BINARY 'Co, khi noi ngay trong thang em dung hao, vi du san yue ba hao.';
UPDATE lesson_qa SET content = 'Từ "bảo hộ lao động" nói như thế nào trong nhà máy?'
WHERE id = 5 AND BINARY content = BINARY 'Tu "bao ho lao dong" noi nhu the nao trong nha may?';
UPDATE lesson_qa SET content = 'Audio bài ăn uống có transcript không?'
WHERE id = 6 AND BINARY content = BINARY 'Audio bai an uong co transcript khong?';
UPDATE lesson_qa SET content = 'Có, em tải file transcript ở mục tài liệu của bài học.'
WHERE id = 7 AND BINARY content = BINARY 'Co, em tai file transcript o muc tai lieu cua bai hoc.';

COMMIT;
