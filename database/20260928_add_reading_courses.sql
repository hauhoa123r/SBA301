-- Hai khóa tự học ngắn: nội dung bài đọc, flashcards, mẫu câu và trắc nghiệm.
-- Có thể chạy lại: tìm khóa theo tên và nội dung con theo thứ tự.
USE chinese_online_learning;
SET NAMES utf8mb4;
SET @reading_ddl = IF(EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='lessons' AND column_name='content'), 'SELECT 1', 'ALTER TABLE lessons ADD COLUMN content TEXT NULL');
PREPARE reading_stmt FROM @reading_ddl; EXECUTE reading_stmt; DEALLOCATE PREPARE reading_stmt;
START TRANSACTION;
SET @reading_teacher = (SELECT id FROM users WHERE id=4);
SET @reading_category = (SELECT id FROM categories WHERE slug='tieng-trung-giao-tiep' LIMIT 1);
INSERT INTO courses (teacher_id, category_id, title, description, price, thumbnail_url, status) SELECT @reading_teacher, @reading_category, 'Tiếng Trung tại quán cà phê', 'Khóa ngắn cho người mới bắt đầu: 2 bài đọc có hội thoại chữ Hán, pinyin và nghĩa tiếng Việt; 12 từ vựng, 6 mẫu câu và 6 câu trắc nghiệm. Thực hành gọi đồ uống, nói sở thích và hỏi giá. Học bằng bài đọc, không kèm video.', 0, '/images/course-cafe.svg', 'PUBLISHED' WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title='Tiếng Trung tại quán cà phê');
SET @reading_course = (SELECT id FROM courses WHERE title='Tiếng Trung tại quán cà phê' ORDER BY id LIMIT 1);
INSERT INTO chapters (course_id, title, order_index) SELECT @reading_course, 'Gọi đồ uống và thanh toán', 1 WHERE NOT EXISTS (SELECT 1 FROM chapters WHERE course_id=@reading_course AND order_index=1);
SET @reading_chapter = (SELECT id FROM chapters WHERE course_id=@reading_course AND order_index=1);
INSERT INTO lessons (chapter_id, title, content, duration_seconds, order_index) SELECT @reading_chapter, 'Gọi món và chọn đồ uống', 'MỤC TIÊU
Gọi một đồ uống bằng mẫu 我要… và đề nghị ít đường một cách lịch sự.

MẪU CÂU CHÍNH
我要 + số lượng + 杯 + đồ uống。
Wǒ yào + số lượng + bēi + đồ uống.
Tôi muốn… cốc… 杯 (bēi) là lượng từ dùng cho đồ uống trong cốc.

HỘI THOẠI
Nhân viên: 你好，你要喝什么？
Nǐ hǎo, nǐ yào hē shénme?
Xin chào, bạn muốn uống gì?

Khách: 我要一杯咖啡。
Wǒ yào yì bēi kāfēi.
Tôi muốn một cốc cà phê.

Nhân viên: 要热的还是冰的？
Yào rè de háishi bīng de?
Bạn muốn loại nóng hay loại lạnh?

Khách: 要热的，请少放糖。
Yào rè de, qǐng shǎo fàng táng.
Cho tôi loại nóng, vui lòng cho ít đường.

GHI NHỚ
还是 (háishi) nối hai lựa chọn trong câu hỏi. 请 (qǐng) giúp lời đề nghị lịch sự hơn. 一 đứng trước 杯 (thanh 1) được đọc thành yì trong lời nói.

TỰ THỰC HÀNH
1. Đọc luân phiên vai nhân viên và khách ba lần.
2. Thay 咖啡 bằng 茶 để gọi trà.
3. Gọi hai cốc cà phê: 我要两杯咖啡。Wǒ yào liǎng bēi kāfēi.
4. Mở mục Từ vựng, ôn sáu từ rồi làm trắc nghiệm.', 900, 1 WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE chapter_id=@reading_chapter AND order_index=1);
SET @reading_lesson = (SELECT id FROM lessons WHERE chapter_id=@reading_chapter AND order_index=1);
INSERT INTO vocabularies (lesson_id, hanzi, pinyin, vietnamese_meaning, order_index) SELECT @reading_lesson, '咖啡', 'kāfēi', 'Cà phê', 1 WHERE NOT EXISTS (SELECT 1 FROM vocabularies WHERE lesson_id=@reading_lesson AND order_index=1);
INSERT INTO vocabularies (lesson_id, hanzi, pinyin, vietnamese_meaning, order_index) SELECT @reading_lesson, '茶', 'chá', 'Trà', 2 WHERE NOT EXISTS (SELECT 1 FROM vocabularies WHERE lesson_id=@reading_lesson AND order_index=2);
INSERT INTO vocabularies (lesson_id, hanzi, pinyin, vietnamese_meaning, order_index) SELECT @reading_lesson, '杯', 'bēi', 'Cốc; lượng từ cho đồ uống', 3 WHERE NOT EXISTS (SELECT 1 FROM vocabularies WHERE lesson_id=@reading_lesson AND order_index=3);
INSERT INTO vocabularies (lesson_id, hanzi, pinyin, vietnamese_meaning, order_index) SELECT @reading_lesson, '热', 'rè', 'Nóng', 4 WHERE NOT EXISTS (SELECT 1 FROM vocabularies WHERE lesson_id=@reading_lesson AND order_index=4);
INSERT INTO vocabularies (lesson_id, hanzi, pinyin, vietnamese_meaning, order_index) SELECT @reading_lesson, '冰', 'bīng', 'Đá; lạnh (trong ngữ cảnh đồ uống)', 5 WHERE NOT EXISTS (SELECT 1 FROM vocabularies WHERE lesson_id=@reading_lesson AND order_index=5);
INSERT INTO vocabularies (lesson_id, hanzi, pinyin, vietnamese_meaning, order_index) SELECT @reading_lesson, '糖', 'táng', 'Đường', 6 WHERE NOT EXISTS (SELECT 1 FROM vocabularies WHERE lesson_id=@reading_lesson AND order_index=6);
INSERT INTO sentence_patterns (lesson_id, chinese_text, pinyin_text, vietnamese_meaning, order_index) SELECT @reading_lesson, '我要一杯咖啡。', 'Wǒ yào yì bēi kāfēi.', 'Tôi muốn một cốc cà phê.', 1 WHERE NOT EXISTS (SELECT 1 FROM sentence_patterns WHERE lesson_id=@reading_lesson AND order_index=1);
INSERT INTO sentence_patterns (lesson_id, chinese_text, pinyin_text, vietnamese_meaning, order_index) SELECT @reading_lesson, '要热的还是冰的？', 'Yào rè de háishi bīng de?', 'Bạn muốn loại nóng hay loại lạnh?', 2 WHERE NOT EXISTS (SELECT 1 FROM sentence_patterns WHERE lesson_id=@reading_lesson AND order_index=2);
INSERT INTO sentence_patterns (lesson_id, chinese_text, pinyin_text, vietnamese_meaning, order_index) SELECT @reading_lesson, '请少放糖。', 'Qǐng shǎo fàng táng.', 'Vui lòng cho ít đường.', 3 WHERE NOT EXISTS (SELECT 1 FROM sentence_patterns WHERE lesson_id=@reading_lesson AND order_index=3);
INSERT INTO quizzes (title, teacher_id, course_id, lesson_id, time_limit_minutes, pass_score, order_index) SELECT 'Ôn tập: Gọi món và chọn đồ uống', @reading_teacher, @reading_course, @reading_lesson, 5, 60, 1 WHERE NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=@reading_lesson);
SET @reading_quiz = (SELECT id FROM quizzes WHERE lesson_id=@reading_lesson ORDER BY id LIMIT 1);
INSERT INTO questions (quiz_id, question_type, content, points, order_index, explanation) SELECT @reading_quiz, 'SINGLE_CHOICE', 'Lượng từ nào phù hợp trong câu 我要一___咖啡？', 10, 1, '杯 dùng để đếm cốc đồ uống; 一杯咖啡 là một cốc cà phê.' WHERE NOT EXISTS (SELECT 1 FROM questions WHERE quiz_id=@reading_quiz AND order_index=1);
SET @reading_question = (SELECT id FROM questions WHERE quiz_id=@reading_quiz AND order_index=1 ORDER BY id LIMIT 1);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, '杯', TRUE, 1 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=1);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, '本', FALSE, 2 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=2);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, '只', FALSE, 3 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=3);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, '张', FALSE, 4 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=4);
INSERT INTO questions (quiz_id, question_type, content, points, order_index, explanation) SELECT @reading_quiz, 'SINGLE_CHOICE', 'Câu nào dùng để đề nghị cho ít đường?', 10, 2, '少放糖 nghĩa là cho ít đường; thêm 请 để nói lịch sự.' WHERE NOT EXISTS (SELECT 1 FROM questions WHERE quiz_id=@reading_quiz AND order_index=2);
SET @reading_question = (SELECT id FROM questions WHERE quiz_id=@reading_quiz AND order_index=2 ORDER BY id LIMIT 1);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, '请少放糖。', TRUE, 1 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=1);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, '我要两杯茶。', FALSE, 2 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=2);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, '要热的。', FALSE, 3 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=3);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, '你好！', FALSE, 4 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=4);
INSERT INTO questions (quiz_id, question_type, content, points, order_index, explanation) SELECT @reading_quiz, 'SINGLE_CHOICE', '要热的还是冰的？ có nghĩa là gì?', 10, 3, '热的 chỉ loại nóng, 冰的 chỉ loại lạnh; 还是 nối hai lựa chọn.' WHERE NOT EXISTS (SELECT 1 FROM questions WHERE quiz_id=@reading_quiz AND order_index=3);
SET @reading_question = (SELECT id FROM questions WHERE quiz_id=@reading_quiz AND order_index=3 ORDER BY id LIMIT 1);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, 'Bạn muốn trả bằng tiền mặt không?', FALSE, 1 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=1);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, 'Bạn muốn loại nóng hay loại lạnh?', TRUE, 2 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=2);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, 'Bạn muốn mấy cốc trà?', FALSE, 3 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=3);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, 'Cà phê này bao nhiêu tiền?', FALSE, 4 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=4);
INSERT INTO lessons (chapter_id, title, content, duration_seconds, order_index) SELECT @reading_chapter, 'Hỏi giá và mang đi', 'MỤC TIÊU
Hỏi tổng tiền, hiểu một số tiền đơn giản và nói mang đồ uống đi.

MẪU CÂU CHÍNH
一共多少钱？Yígòng duōshao qián? Tổng cộng bao nhiêu tiền?
打包，谢谢。Dǎbāo, xièxie. Cho tôi mang đi, cảm ơn.

HỘI THOẠI
Khách: 一共多少钱？
Yígòng duōshao qián?
Tổng cộng bao nhiêu tiền?

Nhân viên: 一共二十五块。这里喝还是打包？
Yígòng èrshíwǔ kuài. Zhèlǐ hē háishi dǎbāo?
Tổng cộng 25 tệ. Bạn uống tại đây hay mang đi?

Khách: 打包，可以扫码吗？
Dǎbāo, kěyǐ sǎomǎ ma?
Mang đi. Tôi có thể quét mã thanh toán không?

Nhân viên: 可以，请扫这里。
Kěyǐ, qǐng sǎo zhèlǐ.
Được, vui lòng quét ở đây.

GHI NHỚ
块 (kuài) là cách gọi đơn vị tệ thường gặp trong giao tiếp. 二十五 = 2 chục + 5 = 25. 扫码 là quét mã; trong tình huống mua hàng thường được hiểu là quét mã thanh toán. Câu hỏi 可以…吗？ dùng để hỏi có thể làm một việc hay không.

TỰ THỰC HÀNH
1. Đọc số tiền: 十块 (shí kuài) = 10 tệ; 十八块 (shíbā kuài) = 18 tệ; 三十块 (sānshí kuài) = 30 tệ.
2. Đóng vai khách: gọi một cốc trà, hỏi tổng tiền rồi nói mang đi.
3. Tự trả lời: 二十五块 là bao nhiêu? Đáp án: 25 tệ.
4. Làm trắc nghiệm để kiểm tra cách hỏi giá và thanh toán.', 900, 2 WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE chapter_id=@reading_chapter AND order_index=2);
SET @reading_lesson = (SELECT id FROM lessons WHERE chapter_id=@reading_chapter AND order_index=2);
INSERT INTO vocabularies (lesson_id, hanzi, pinyin, vietnamese_meaning, order_index) SELECT @reading_lesson, '一共', 'yígòng', 'Tổng cộng', 1 WHERE NOT EXISTS (SELECT 1 FROM vocabularies WHERE lesson_id=@reading_lesson AND order_index=1);
INSERT INTO vocabularies (lesson_id, hanzi, pinyin, vietnamese_meaning, order_index) SELECT @reading_lesson, '多少钱', 'duōshao qián', 'Bao nhiêu tiền', 2 WHERE NOT EXISTS (SELECT 1 FROM vocabularies WHERE lesson_id=@reading_lesson AND order_index=2);
INSERT INTO vocabularies (lesson_id, hanzi, pinyin, vietnamese_meaning, order_index) SELECT @reading_lesson, '块', 'kuài', 'Tệ (cách nói thông dụng)', 3 WHERE NOT EXISTS (SELECT 1 FROM vocabularies WHERE lesson_id=@reading_lesson AND order_index=3);
INSERT INTO vocabularies (lesson_id, hanzi, pinyin, vietnamese_meaning, order_index) SELECT @reading_lesson, '打包', 'dǎbāo', 'Gói lại; mang đi', 4 WHERE NOT EXISTS (SELECT 1 FROM vocabularies WHERE lesson_id=@reading_lesson AND order_index=4);
INSERT INTO vocabularies (lesson_id, hanzi, pinyin, vietnamese_meaning, order_index) SELECT @reading_lesson, '扫码', 'sǎomǎ', 'Quét mã', 5 WHERE NOT EXISTS (SELECT 1 FROM vocabularies WHERE lesson_id=@reading_lesson AND order_index=5);
INSERT INTO vocabularies (lesson_id, hanzi, pinyin, vietnamese_meaning, order_index) SELECT @reading_lesson, '可以', 'kěyǐ', 'Có thể; được phép', 6 WHERE NOT EXISTS (SELECT 1 FROM vocabularies WHERE lesson_id=@reading_lesson AND order_index=6);
INSERT INTO sentence_patterns (lesson_id, chinese_text, pinyin_text, vietnamese_meaning, order_index) SELECT @reading_lesson, '一共多少钱？', 'Yígòng duōshao qián?', 'Tổng cộng bao nhiêu tiền?', 1 WHERE NOT EXISTS (SELECT 1 FROM sentence_patterns WHERE lesson_id=@reading_lesson AND order_index=1);
INSERT INTO sentence_patterns (lesson_id, chinese_text, pinyin_text, vietnamese_meaning, order_index) SELECT @reading_lesson, '打包，谢谢。', 'Dǎbāo, xièxie.', 'Cho tôi mang đi, cảm ơn.', 2 WHERE NOT EXISTS (SELECT 1 FROM sentence_patterns WHERE lesson_id=@reading_lesson AND order_index=2);
INSERT INTO sentence_patterns (lesson_id, chinese_text, pinyin_text, vietnamese_meaning, order_index) SELECT @reading_lesson, '可以扫码吗？', 'Kěyǐ sǎomǎ ma?', 'Tôi có thể quét mã thanh toán không?', 3 WHERE NOT EXISTS (SELECT 1 FROM sentence_patterns WHERE lesson_id=@reading_lesson AND order_index=3);
INSERT INTO quizzes (title, teacher_id, course_id, lesson_id, time_limit_minutes, pass_score, order_index) SELECT 'Ôn tập: Hỏi giá và mang đi', @reading_teacher, @reading_course, @reading_lesson, 5, 60, 2 WHERE NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=@reading_lesson);
SET @reading_quiz = (SELECT id FROM quizzes WHERE lesson_id=@reading_lesson ORDER BY id LIMIT 1);
INSERT INTO questions (quiz_id, question_type, content, points, order_index, explanation) SELECT @reading_quiz, 'SINGLE_CHOICE', '二十五块 là bao nhiêu tiền?', 10, 1, '二十 là hai chục; thêm 五 là 25.' WHERE NOT EXISTS (SELECT 1 FROM questions WHERE quiz_id=@reading_quiz AND order_index=1);
SET @reading_question = (SELECT id FROM questions WHERE quiz_id=@reading_quiz AND order_index=1 ORDER BY id LIMIT 1);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, '15 tệ', FALSE, 1 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=1);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, '20 tệ', FALSE, 2 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=2);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, '25 tệ', TRUE, 3 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=3);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, '50 tệ', FALSE, 4 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=4);
INSERT INTO questions (quiz_id, question_type, content, points, order_index, explanation) SELECT @reading_quiz, 'SINGLE_CHOICE', 'Bạn muốn mang đồ uống đi. Bạn nói thế nào?', 10, 2, '打包 dùng khi muốn gói lại hoặc mang đi.' WHERE NOT EXISTS (SELECT 1 FROM questions WHERE quiz_id=@reading_quiz AND order_index=2);
SET @reading_question = (SELECT id FROM questions WHERE quiz_id=@reading_quiz AND order_index=2 ORDER BY id LIMIT 1);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, '这里喝。', FALSE, 1 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=1);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, '打包，谢谢。', TRUE, 2 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=2);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, '一共多少钱？', FALSE, 3 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=3);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, '请少放糖。', FALSE, 4 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=4);
INSERT INTO questions (quiz_id, question_type, content, points, order_index, explanation) SELECT @reading_quiz, 'SINGLE_CHOICE', 'Câu nào hỏi có thể quét mã thanh toán không?', 10, 3, '可以…吗？ hỏi có thể làm một việc hay không; 扫码 là quét mã.' WHERE NOT EXISTS (SELECT 1 FROM questions WHERE quiz_id=@reading_quiz AND order_index=3);
SET @reading_question = (SELECT id FROM questions WHERE quiz_id=@reading_quiz AND order_index=3 ORDER BY id LIMIT 1);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, '可以扫码吗？', TRUE, 1 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=1);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, '要热的还是冰的？', FALSE, 2 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=2);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, '你要喝什么？', FALSE, 3 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=3);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, '一共二十五块。', FALSE, 4 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=4);
INSERT INTO courses (teacher_id, category_id, title, description, price, thumbnail_url, status) SELECT @reading_teacher, @reading_category, 'Tiếng Trung hỏi đường và đi lại', 'Khóa ngắn cho người mới bắt đầu: 2 bài đọc có hội thoại chữ Hán, pinyin và nghĩa tiếng Việt; 12 từ vựng, 6 mẫu câu và 6 câu trắc nghiệm. Luyện hỏi địa điểm, hiểu rẽ trái, rẽ phải và hỏi thời gian đi bộ. Học bằng bài đọc, không kèm video.', 0, '/images/course-directions.svg', 'PUBLISHED' WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title='Tiếng Trung hỏi đường và đi lại');
SET @reading_course = (SELECT id FROM courses WHERE title='Tiếng Trung hỏi đường và đi lại' ORDER BY id LIMIT 1);
INSERT INTO chapters (course_id, title, order_index) SELECT @reading_course, 'Tìm địa điểm và hiểu chỉ dẫn', 1 WHERE NOT EXISTS (SELECT 1 FROM chapters WHERE course_id=@reading_course AND order_index=1);
SET @reading_chapter = (SELECT id FROM chapters WHERE course_id=@reading_course AND order_index=1);
INSERT INTO lessons (chapter_id, title, content, duration_seconds, order_index) SELECT @reading_chapter, 'Hỏi địa điểm một cách lịch sự', 'MỤC TIÊU
Mở lời hỏi đường và hỏi vị trí của ga tàu điện, nhà vệ sinh hoặc khách sạn.

MẪU CÂU CHÍNH
请问，+ địa điểm + 在哪里？
Qǐngwèn, + địa điểm + zài nǎlǐ?
Xin hỏi,… ở đâu?

HỘI THOẠI
Khách: 请问，地铁站在哪里？
Qǐngwèn, dìtiězhàn zài nǎlǐ?
Xin hỏi, ga tàu điện ngầm ở đâu?

Người đi đường: 地铁站在前面。
Dìtiězhàn zài qiánmiàn.
Ga tàu điện ngầm ở phía trước.

Khách: 远吗？
Yuǎn ma?
Có xa không?

Người đi đường: 不远。走路五分钟。
Bù yuǎn. Zǒulù wǔ fēnzhōng.
Không xa. Đi bộ năm phút.

Khách: 谢谢！
Xièxie!
Cảm ơn!

GHI NHỚ
请问 là lời mở đầu lịch sự khi hỏi người lạ. 在 (zài) đứng trước vị trí. 哪里 (nǎlǐ) nghĩa là ở đâu. Không thêm 吗 vào câu đã có từ hỏi 哪里. 远吗？ là câu hỏi có/không nên dùng 吗.

TỰ THỰC HÀNH
1. Thay 地铁站 bằng 洗手间 để hỏi nhà vệ sinh.
2. Thay bằng 酒店 để hỏi khách sạn.
3. Đáp án mẫu: 请问，洗手间在哪里？Qǐngwèn, xǐshǒujiān zài nǎlǐ?
4. Đọc hội thoại cùng một người bạn, sau đó đổi vai.', 900, 1 WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE chapter_id=@reading_chapter AND order_index=1);
SET @reading_lesson = (SELECT id FROM lessons WHERE chapter_id=@reading_chapter AND order_index=1);
INSERT INTO vocabularies (lesson_id, hanzi, pinyin, vietnamese_meaning, order_index) SELECT @reading_lesson, '请问', 'qǐngwèn', 'Xin hỏi', 1 WHERE NOT EXISTS (SELECT 1 FROM vocabularies WHERE lesson_id=@reading_lesson AND order_index=1);
INSERT INTO vocabularies (lesson_id, hanzi, pinyin, vietnamese_meaning, order_index) SELECT @reading_lesson, '地铁站', 'dìtiězhàn', 'Ga tàu điện ngầm', 2 WHERE NOT EXISTS (SELECT 1 FROM vocabularies WHERE lesson_id=@reading_lesson AND order_index=2);
INSERT INTO vocabularies (lesson_id, hanzi, pinyin, vietnamese_meaning, order_index) SELECT @reading_lesson, '哪里', 'nǎlǐ', 'Ở đâu', 3 WHERE NOT EXISTS (SELECT 1 FROM vocabularies WHERE lesson_id=@reading_lesson AND order_index=3);
INSERT INTO vocabularies (lesson_id, hanzi, pinyin, vietnamese_meaning, order_index) SELECT @reading_lesson, '前面', 'qiánmiàn', 'Phía trước', 4 WHERE NOT EXISTS (SELECT 1 FROM vocabularies WHERE lesson_id=@reading_lesson AND order_index=4);
INSERT INTO vocabularies (lesson_id, hanzi, pinyin, vietnamese_meaning, order_index) SELECT @reading_lesson, '洗手间', 'xǐshǒujiān', 'Nhà vệ sinh', 5 WHERE NOT EXISTS (SELECT 1 FROM vocabularies WHERE lesson_id=@reading_lesson AND order_index=5);
INSERT INTO vocabularies (lesson_id, hanzi, pinyin, vietnamese_meaning, order_index) SELECT @reading_lesson, '酒店', 'jiǔdiàn', 'Khách sạn', 6 WHERE NOT EXISTS (SELECT 1 FROM vocabularies WHERE lesson_id=@reading_lesson AND order_index=6);
INSERT INTO sentence_patterns (lesson_id, chinese_text, pinyin_text, vietnamese_meaning, order_index) SELECT @reading_lesson, '请问，地铁站在哪里？', 'Qǐngwèn, dìtiězhàn zài nǎlǐ?', 'Xin hỏi, ga tàu điện ngầm ở đâu?', 1 WHERE NOT EXISTS (SELECT 1 FROM sentence_patterns WHERE lesson_id=@reading_lesson AND order_index=1);
INSERT INTO sentence_patterns (lesson_id, chinese_text, pinyin_text, vietnamese_meaning, order_index) SELECT @reading_lesson, '地铁站在前面。', 'Dìtiězhàn zài qiánmiàn.', 'Ga tàu điện ngầm ở phía trước.', 2 WHERE NOT EXISTS (SELECT 1 FROM sentence_patterns WHERE lesson_id=@reading_lesson AND order_index=2);
INSERT INTO sentence_patterns (lesson_id, chinese_text, pinyin_text, vietnamese_meaning, order_index) SELECT @reading_lesson, '请问，洗手间在哪里？', 'Qǐngwèn, xǐshǒujiān zài nǎlǐ?', 'Xin hỏi, nhà vệ sinh ở đâu?', 3 WHERE NOT EXISTS (SELECT 1 FROM sentence_patterns WHERE lesson_id=@reading_lesson AND order_index=3);
INSERT INTO quizzes (title, teacher_id, course_id, lesson_id, time_limit_minutes, pass_score, order_index) SELECT 'Ôn tập: Hỏi địa điểm một cách lịch sự', @reading_teacher, @reading_course, @reading_lesson, 5, 60, 1 WHERE NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=@reading_lesson);
SET @reading_quiz = (SELECT id FROM quizzes WHERE lesson_id=@reading_lesson ORDER BY id LIMIT 1);
INSERT INTO questions (quiz_id, question_type, content, points, order_index, explanation) SELECT @reading_quiz, 'SINGLE_CHOICE', 'Cụm nào phù hợp để mở lời hỏi đường lịch sự?', 10, 1, '请问 có nghĩa là xin hỏi, dùng trước câu hỏi với người lạ.' WHERE NOT EXISTS (SELECT 1 FROM questions WHERE quiz_id=@reading_quiz AND order_index=1);
SET @reading_question = (SELECT id FROM questions WHERE quiz_id=@reading_quiz AND order_index=1 ORDER BY id LIMIT 1);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, '打包', FALSE, 1 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=1);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, '请问', TRUE, 2 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=2);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, '扫码', FALSE, 3 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=3);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, '一共', FALSE, 4 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=4);
INSERT INTO questions (quiz_id, question_type, content, points, order_index, explanation) SELECT @reading_quiz, 'SINGLE_CHOICE', '地铁站在前面。 cho biết ga tàu điện ở đâu?', 10, 2, '前面 có nghĩa là phía trước.' WHERE NOT EXISTS (SELECT 1 FROM questions WHERE quiz_id=@reading_quiz AND order_index=2);
SET @reading_question = (SELECT id FROM questions WHERE quiz_id=@reading_quiz AND order_index=2 ORDER BY id LIMIT 1);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, 'Phía sau', FALSE, 1 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=1);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, 'Bên trái', FALSE, 2 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=2);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, 'Phía trước', TRUE, 3 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=3);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, 'Trong khách sạn', FALSE, 4 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=4);
INSERT INTO questions (quiz_id, question_type, content, points, order_index, explanation) SELECT @reading_quiz, 'SINGLE_CHOICE', 'Câu nào hỏi vị trí nhà vệ sinh?', 10, 3, '洗手间 là nhà vệ sinh; 在哪里 hỏi ở đâu.' WHERE NOT EXISTS (SELECT 1 FROM questions WHERE quiz_id=@reading_quiz AND order_index=3);
SET @reading_question = (SELECT id FROM questions WHERE quiz_id=@reading_quiz AND order_index=3 ORDER BY id LIMIT 1);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, '洗手间在哪里？', TRUE, 1 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=1);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, '一共多少钱？', FALSE, 2 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=2);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, '要热的还是冰的？', FALSE, 3 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=3);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, '可以扫码吗？', FALSE, 4 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=4);
INSERT INTO lessons (chapter_id, title, content, duration_seconds, order_index) SELECT @reading_chapter, 'Hiểu chỉ dẫn và hỏi thời gian đi bộ', 'MỤC TIÊU
Hiểu chỉ dẫn đi thẳng, rẽ trái, rẽ phải và hỏi cần đi bộ bao lâu.

MẪU CÂU CHÍNH
一直走，然后往右拐。
Yìzhí zǒu, ránhòu wǎng yòu guǎi.
Đi thẳng, sau đó rẽ phải.

HỘI THOẠI
Khách: 请问，去地铁站怎么走？
Qǐngwèn, qù dìtiězhàn zěnme zǒu?
Xin hỏi, đi đến ga tàu điện ngầm thế nào?

Người đi đường: 一直走，到路口往右拐。
Yìzhí zǒu, dào lùkǒu wǎng yòu guǎi.
Đi thẳng, đến giao lộ thì rẽ phải.

Khách: 走路要多久？
Zǒulù yào duōjiǔ?
Đi bộ mất bao lâu?

Người đi đường: 大概五分钟。
Dàgài wǔ fēnzhōng.
Khoảng năm phút.

Khách: 谢谢！
Xièxie!
Cảm ơn!

GHI NHỚ
往 + hướng + 拐 diễn tả rẽ theo hướng đó. 往左拐 = rẽ trái; 往右拐 = rẽ phải. 多久 hỏi khoảng thời gian, còn 哪里 hỏi địa điểm. 大概 (dàgài) cho biết thời gian chỉ là ước lượng.

TỰ THỰC HÀNH
1. Vẽ một đường thẳng đến ngã tư rồi rẽ phải; đọc chỉ dẫn khi đưa ngón tay theo đường vẽ.
2. Đổi chỉ dẫn thành rẽ trái: 一直走，到路口往左拐。
3. Tập nói khoảng mười phút: 大概十分钟。Dàgài shí fēnzhōng.
4. Tự tạo hội thoại bốn lượt: hỏi đường, chỉ dẫn, hỏi thời gian, trả lời.', 900, 2 WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE chapter_id=@reading_chapter AND order_index=2);
SET @reading_lesson = (SELECT id FROM lessons WHERE chapter_id=@reading_chapter AND order_index=2);
INSERT INTO vocabularies (lesson_id, hanzi, pinyin, vietnamese_meaning, order_index) SELECT @reading_lesson, '一直走', 'yìzhí zǒu', 'Đi thẳng', 1 WHERE NOT EXISTS (SELECT 1 FROM vocabularies WHERE lesson_id=@reading_lesson AND order_index=1);
INSERT INTO vocabularies (lesson_id, hanzi, pinyin, vietnamese_meaning, order_index) SELECT @reading_lesson, '左', 'zuǒ', 'Trái', 2 WHERE NOT EXISTS (SELECT 1 FROM vocabularies WHERE lesson_id=@reading_lesson AND order_index=2);
INSERT INTO vocabularies (lesson_id, hanzi, pinyin, vietnamese_meaning, order_index) SELECT @reading_lesson, '右', 'yòu', 'Phải', 3 WHERE NOT EXISTS (SELECT 1 FROM vocabularies WHERE lesson_id=@reading_lesson AND order_index=3);
INSERT INTO vocabularies (lesson_id, hanzi, pinyin, vietnamese_meaning, order_index) SELECT @reading_lesson, '路口', 'lùkǒu', 'Giao lộ; chỗ đường giao nhau', 4 WHERE NOT EXISTS (SELECT 1 FROM vocabularies WHERE lesson_id=@reading_lesson AND order_index=4);
INSERT INTO vocabularies (lesson_id, hanzi, pinyin, vietnamese_meaning, order_index) SELECT @reading_lesson, '多久', 'duōjiǔ', 'Bao lâu', 5 WHERE NOT EXISTS (SELECT 1 FROM vocabularies WHERE lesson_id=@reading_lesson AND order_index=5);
INSERT INTO vocabularies (lesson_id, hanzi, pinyin, vietnamese_meaning, order_index) SELECT @reading_lesson, '分钟', 'fēnzhōng', 'Phút', 6 WHERE NOT EXISTS (SELECT 1 FROM vocabularies WHERE lesson_id=@reading_lesson AND order_index=6);
INSERT INTO sentence_patterns (lesson_id, chinese_text, pinyin_text, vietnamese_meaning, order_index) SELECT @reading_lesson, '一直走，到路口往右拐。', 'Yìzhí zǒu, dào lùkǒu wǎng yòu guǎi.', 'Đi thẳng, đến giao lộ thì rẽ phải.', 1 WHERE NOT EXISTS (SELECT 1 FROM sentence_patterns WHERE lesson_id=@reading_lesson AND order_index=1);
INSERT INTO sentence_patterns (lesson_id, chinese_text, pinyin_text, vietnamese_meaning, order_index) SELECT @reading_lesson, '走路要多久？', 'Zǒulù yào duōjiǔ?', 'Đi bộ mất bao lâu?', 2 WHERE NOT EXISTS (SELECT 1 FROM sentence_patterns WHERE lesson_id=@reading_lesson AND order_index=2);
INSERT INTO sentence_patterns (lesson_id, chinese_text, pinyin_text, vietnamese_meaning, order_index) SELECT @reading_lesson, '大概五分钟。', 'Dàgài wǔ fēnzhōng.', 'Khoảng năm phút.', 3 WHERE NOT EXISTS (SELECT 1 FROM sentence_patterns WHERE lesson_id=@reading_lesson AND order_index=3);
INSERT INTO quizzes (title, teacher_id, course_id, lesson_id, time_limit_minutes, pass_score, order_index) SELECT 'Ôn tập: Hiểu chỉ dẫn và hỏi thời gian đi bộ', @reading_teacher, @reading_course, @reading_lesson, 5, 60, 2 WHERE NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id=@reading_lesson);
SET @reading_quiz = (SELECT id FROM quizzes WHERE lesson_id=@reading_lesson ORDER BY id LIMIT 1);
INSERT INTO questions (quiz_id, question_type, content, points, order_index, explanation) SELECT @reading_quiz, 'SINGLE_CHOICE', '往右拐 có nghĩa là gì?', 10, 1, '右 là bên phải, 往右拐 là rẽ phải.' WHERE NOT EXISTS (SELECT 1 FROM questions WHERE quiz_id=@reading_quiz AND order_index=1);
SET @reading_question = (SELECT id FROM questions WHERE quiz_id=@reading_quiz AND order_index=1 ORDER BY id LIMIT 1);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, 'Đi thẳng', FALSE, 1 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=1);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, 'Rẽ trái', FALSE, 2 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=2);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, 'Rẽ phải', TRUE, 3 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=3);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, 'Quay về khách sạn', FALSE, 4 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=4);
INSERT INTO questions (quiz_id, question_type, content, points, order_index, explanation) SELECT @reading_quiz, 'SINGLE_CHOICE', 'Muốn hỏi đi bộ mất bao lâu, bạn dùng câu nào?', 10, 2, '多久 hỏi khoảng thời gian; 走路 là đi bộ.' WHERE NOT EXISTS (SELECT 1 FROM questions WHERE quiz_id=@reading_quiz AND order_index=2);
SET @reading_question = (SELECT id FROM questions WHERE quiz_id=@reading_quiz AND order_index=2 ORDER BY id LIMIT 1);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, '走路要多久？', TRUE, 1 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=1);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, '地铁站在哪里？', FALSE, 2 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=2);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, '一共多少钱？', FALSE, 3 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=3);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, '你要喝什么？', FALSE, 4 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=4);
INSERT INTO questions (quiz_id, question_type, content, points, order_index, explanation) SELECT @reading_quiz, 'SINGLE_CHOICE', '大概五分钟。 có nghĩa là gì?', 10, 3, '大概 là khoảng, 五 là năm, 分钟 là phút.' WHERE NOT EXISTS (SELECT 1 FROM questions WHERE quiz_id=@reading_quiz AND order_index=3);
SET @reading_question = (SELECT id FROM questions WHERE quiz_id=@reading_quiz AND order_index=3 ORDER BY id LIMIT 1);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, 'Đúng năm giờ', FALSE, 1 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=1);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, 'Khoảng năm phút', TRUE, 2 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=2);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, 'Năm tệ', FALSE, 3 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=3);
INSERT INTO answers (question_id, content, is_correct, order_index) SELECT @reading_question, 'Đi thẳng năm giao lộ', FALSE, 4 WHERE NOT EXISTS (SELECT 1 FROM answers WHERE question_id=@reading_question AND order_index=4);
COMMIT;
