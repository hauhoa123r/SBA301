USE chinese_online_learning;

SET NAMES utf8mb4;

-- 1. Create Vocabularies table if not exists (Already run)
-- CREATE TABLE IF NOT EXISTS vocabularies ...
-- 2. Create Sentence Patterns table if not exists (Already run)
-- CREATE TABLE IF NOT EXISTS sentence_patterns ...
-- 3. Modify Questions table (Already run)
-- 4. Modify Answers table (Already run)
-- 5. Modify Student Answers table (Already run)
-- 6. Modify Quizzes table: drop the old type column (Already run)

-- -------------------------------------------------------------
-- SEEDING DATA FOR CHAPTER 3, LESSON 1
-- -------------------------------------------------------------

-- Create Chapter 3 for Course 1 (Tieng Trung giao tiep co ban) if it doesn't exist
INSERT INTO chapters (course_id, title, order_index)
SELECT 1, 'Chương 3: Thu thập thông tin khách hàng', 3
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM chapters WHERE course_id = 1 AND order_index = 3
);

-- Store the chapter id
SET @chapter_3_id = (SELECT id FROM chapters WHERE course_id = 1 AND order_index = 3 LIMIT 1);

-- Create Lesson 1 under Chapter 3 if it doesn't exist
INSERT INTO lessons (chapter_id, title, video_url, duration_seconds, order_index)
SELECT @chapter_3_id, 'Lesson 1 - Hỏi thông tin cá nhân của khách hàng', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1783833897/video1_r1i65s.mp4', 180, 1
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM lessons WHERE chapter_id = @chapter_3_id AND order_index = 1
);

-- Update the lesson video URL in case it already existed with default placeholder
UPDATE lessons 
SET video_url = 'https://res.cloudinary.com/rir6b8kp/video/upload/v1783833897/video1_r1i65s.mp4'
WHERE chapter_id = @chapter_3_id AND order_index = 1;

-- Store the lesson id
SET @lesson_1_id = (SELECT id FROM lessons WHERE chapter_id = @chapter_3_id AND order_index = 1 LIMIT 1);

-- Seed Vocabularies (Flashcards) for Lesson 1
-- Delete existing first to make it re-runnable
DELETE FROM vocabularies WHERE lesson_id = @lesson_1_id;

INSERT INTO vocabularies (lesson_id, hanzi, pinyin, vietnamese_meaning, image_url, audio_url, order_index)
VALUES 
(@lesson_1_id, '名字', 'míngzi', 'tên', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1783834344/T%C3%AAn_tplc0l.jpg', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1783834384/T%C3%AAn_df9p8x.mp3', 1),
(@lesson_1_id, '姓', 'xìng', 'họ (họ danh)', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1783834331/H%E1%BB%8D_a47jhh.jpg', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1783834370/H%E1%BB%8D_ljl0zb.mp3', 2),
(@lesson_1_id, '职务', 'zhíwù', 'chức vụ', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1783834326/Ch%E1%BB%A9c_v%E1%BB%A5_xlpnsn.jpg', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1783834364/Ch%E1%BB%A9c_v%E1%BB%A5_znovly.mp3', 3),
(@lesson_1_id, '经理', 'jīnglǐ', 'trưởng phòng (kinh doanh) / giám đốc', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1783834634/Tr%C6%B0%E1%BB%9Fng_ph%C3%B2ng_l3blgq.jpg', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1783834381/Tr%C6%B0%E1%BB%9Fng_ph%C3%B2ng_g2ozsb.mp3', 4),
(@lesson_1_id, '总经理', 'zǒngjīnglǐ', 'Tổng giám đốc', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1783834348/T%E1%BB%95ng_gi%C3%A1m_%C4%91%E1%BB%91c_b5xlff.jpg', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1783834388/T%E1%BB%95ng_gi%C3%A1m_%C4%91%E1%BB%91c_og83fk.mp3', 5),
(@lesson_1_id, '管理', 'guǎnlǐ', 'quản lý', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1783834630/Qu%E1%BA%A3n_l%C3%BD_ohfvd6.jpg', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1783834377/Qu%E1%BA%A3n_l%C3%BD_geeh2q.mp3', 6),
(@lesson_1_id, '员工', 'yuángōng', 'nhân viên', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1783834335/Nh%C3%A2n_vi%C3%AAn_gzrd62.jpg', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1783834373/Nh%C3%A2n_vi%C3%AAn_rxb9ie.mp3', 7),
(@lesson_1_id, '称呼', 'chēnghu', 'xưng hô', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1783834637/X%C6%B0ng_h%C3%B4_fbsnnz.jpg', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1783834391/X%C6%B0ng_h%C3%B4_porl4z.mp3', 8),
(@lesson_1_id, '公司', 'gōngsī', 'công ty', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1783834329/C%C3%B4ng_ty_ak4dxd.jpg', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1783834367/C%C3%B4ng_ty_lybysg.mp3', 9);

-- Seed Sentence Patterns for Lesson 1
DELETE FROM sentence_patterns WHERE lesson_id = @lesson_1_id;

-- Get the vocabulary ids for reference
SET @vocab_name_id = (SELECT id FROM vocabularies WHERE lesson_id = @lesson_1_id AND hanzi = '名字' LIMIT 1);
SET @vocab_pos_id = (SELECT id FROM vocabularies WHERE lesson_id = @lesson_1_id AND hanzi = '职务' LIMIT 1);
SET @vocab_resp_id = (SELECT id FROM vocabularies WHERE lesson_id = @lesson_1_id AND hanzi = '称呼' LIMIT 1);

INSERT INTO sentence_patterns (lesson_id, vocabulary_id, chinese_text, pinyin_text, vietnamese_meaning, audio_url, order_index)
VALUES
(@lesson_1_id, @vocab_name_id, '您叫什么名字？', 'Nín jiào shénme míngzi?', 'Anh/chị tên là gì?', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1783860596/M%E1%BA%ABu_c%C3%A2u_1_ijulk0.mp3', 1),
(@lesson_1_id, @vocab_pos_id, '您在公司担任什么职位？', 'Nín zài gōngsī dānrèn shénme zhíwèi?', 'Anh/chị đang giữ vị trí gì ở công ty?', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1783860596/M%E1%BA%ABu_c%C3%A2u_2_yyupnr.mp3', 2),
(@lesson_1_id, NULL, '您负责哪个部门？', 'Nín fùzé nǎge bùmén?', 'Anh/chị phụ trách bộ phận nào?', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1783860597/M%E1%BA%ABu_c%C3%A2u_3_cmaeg2.mp3', 3),
(@lesson_1_id, @vocab_resp_id, '我可以称呼您为阮经理吗？', 'Wǒ kěyǐ chēnghu nín wèi Ruǎn jīnglǐ ma?', 'Tôi xin phép được xưng hô với anh/chị là Trưởng phòng Nguyễn được không?', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1783860596/M%E1%BA%ABu_c%C3%A2u_4_ffehvg.mp3', 4);


-- Seed Quizzes for Lesson 1
DELETE FROM quizzes WHERE lesson_id = @lesson_1_id;

INSERT INTO quizzes (title, lesson_id, chapter_id, time_limit_minutes, pass_score)
VALUES ('Bài trắc nghiệm Lesson 1: Hỏi thông tin cá nhân', @lesson_1_id, @chapter_3_id, 10, 50);

SET @quiz_1_id = LAST_INSERT_ID();

-- Seed Questions for Quiz 1
DELETE FROM questions WHERE quiz_id = @quiz_1_id;

-- Question 1: Listening Choice (Nghe và chọn - "请问您在贵公司主要负责...")
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, meta_data, explanation)
VALUES (
    @quiz_1_id, 
    'LISTENING_CHOICE', 
    'Nghe đoạn âm thanh sau và chọn nghĩa tiếng Việt đúng của câu: "请问您在贵公司...?"', 
    'https://res.cloudinary.com/rir6b8kp/video/upload/v1783834137/C%C3%A2u_h%E1%BB%8Fi_luy%E1%BB%87n_nghe_1_su1rpv.mp3',
    10, 
    1, 
    NULL,
    'Ý nghĩa hoàn chỉnh: Xin hỏi ngài chủ yếu phụ trách mảng nghiệp vụ nào tại quý công ty?'
);
SET @q1_id = LAST_INSERT_ID();

INSERT INTO answers (question_id, content, is_correct, order_index)
VALUES 
(@q1_id, 'Xin hỏi anh/chị chủ yếu phụ trách công việc gì ở quý công ty?', TRUE, 1),
(@q1_id, 'Xin hỏi anh/chị tên là gì?', FALSE, 2),
(@q1_id, 'Xin hỏi công ty của anh/chị ở đâu?', FALSE, 3);


-- Question 2: Listening Choice (Nghe và chọn - "李先生是技术部の...")
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, meta_data, explanation)
VALUES (
    @quiz_1_id, 
    'LISTENING_CHOICE', 
    'Nghe đoạn âm thanh sau và chọn nghĩa tiếng Việt đúng của câu: "李先生 là bộ phận kỹ thuật của...?" (thực chất: "李先生是技术部的...")', 
    'https://res.cloudinary.com/rir6b8kp/video/upload/v1783834140/C%C3%A2u_h%E1%BB%8Fi_luy%E1%BB%87n_nghe_2_spqogk.mp3', 
    10, 
    2, 
    NULL,
    'Ý nghĩa hoàn chỉnh: Ông Lý là Quản lý của bộ phận kỹ thuật, anh ấy chịu trách nhiệm bảo trì hệ thống.'
);
SET @q2_id = LAST_INSERT_ID();

INSERT INTO answers (question_id, content, is_correct, order_index)
VALUES 
(@q2_id, 'Ông Lý là trưởng phòng của bộ phận kỹ thuật.', TRUE, 1),
(@q2_id, 'Ông Lý là nhân viên bộ phận kinh doanh.', FALSE, 2),
(@q2_id, 'Ông Lý là tổng giám đốc công ty.', FALSE, 3);


-- Question 3: Listening Choice (Nghe và chọn - "阮先生，请问 tôi nên xưng hô như thế nào...?")
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, meta_data, explanation)
VALUES (
    @quiz_1_id, 
    'LISTENING_CHOICE', 
    'Nghe đoạn âm thanh sau và chọn nghĩa tiếng Việt đúng của câu: "阮先生，请问 tôi nên xưng hô như thế nào...?"', 
    'https://res.cloudinary.com/rir6b8kp/video/upload/v1783834143/C%C3%A2u_h%E1%BB%8Fi_luy%E1%BB%87n_nghe_3_tqyapk.mp3', 
    10, 
    3, 
    NULL,
    'Ý nghĩa hoàn chỉnh: Thưa ông Nguyễn, xin hỏi tôi nên xưng hô với ông như thế nào?'
);
SET @q3_id = LAST_INSERT_ID();

INSERT INTO answers (question_id, content, is_correct, order_index)
VALUES 
(@q3_id, 'Thưa ông Nguyễn, xin hỏi tôi nên xưng hô với ông như thế nào?', TRUE, 1),
(@q3_id, 'Thưa ông Nguyễn, xin hỏi ông bao nhiêu tuổi?', FALSE, 2),
(@q3_id, 'Thưa ông Nguyễn, xin hỏi ông sống ở đâu?', FALSE, 3);


-- Question 4: Listening Dialogue Ordering (Sắp xếp hội thoại giao tiếp công sở)
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, meta_data, explanation)
VALUES (
    @quiz_1_id, 
    'LISTENING_CHOICE', 
    'Nghe đoạn hội thoại sau và sắp xếp các câu theo thứ tự',
    'https://res.cloudinary.com/rir6b8kp/video/upload/v1784005358/C%C3%A2u_h%E1%BB%8Fi_luy%E1%BB%87n_nghe_4_d7ice0.mp3', 
    10, 
    4, 
    NULL,
    'Cuộc hội thoại bắt đầu bằng C, khi một người chủ động chào hỏi và xác nhận chức vụ của đối phương. Tiếp theo, A trả lời bằng cách giới thiệu tên, chức vụ và đưa danh thiếp. Sau khi nhận được thông tin, B đáp lại bằng lời chào lịch sự và tự giới thiệu bản thân cũng như công ty của mình. Dựa trên thông tin đó, D tiếp tục cuộc trò chuyện bằng cách hỏi về lĩnh vực kinh doanh của công ty. Cuối cùng, E trả lời trực tiếp câu hỏi ở câu D, giới thiệu rằng công ty chủ yếu phát triển phần mềm doanh nghiệp. Thứ tự này phù hợp với trình tự giao tiếp trong một buổi gặp gỡ và trao đổi danh thiếp trong môi trường công việc.'
);
SET @q4_id = LAST_INSERT_ID();

INSERT INTO answers (question_id, content, is_correct, order_index)
VALUES 
(@q4_id, 'A → C → B → D → E', FALSE, 1),
(@q4_id, 'A → B → C → D → E', FALSE, 2),
(@q4_id, 'C → A → D → B → E', FALSE, 3),
(@q4_id, 'C → A → B → D → E', TRUE, 4);


-- Question 5 (Group 1 - Substitution MCQ 1):
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, meta_data, explanation)
VALUES (
    @quiz_1_id, 
    'MULTIPLE_CHOICE', 
    'Đối tác giao tiếp là người đại diện pháp luật cao nhất của công ty (Tổng giám đốc). Chọn từ thích hợp để hoàn thiện câu xã giao: "请问，我可以直接称呼您为张_____吗？"', 
    NULL, 
    10, 
    5, 
    NULL,
    '"总经理" (Tổng giám đốc) là danh xưng phù hợp nhất để xưng hô với người đứng đầu điều hành doanh nghiệp, thể hiện sự kính trọng đúng mực trong lễ nghi thương mại.'
);
SET @q5_id = LAST_INSERT_ID();

INSERT INTO answers (question_id, content, is_correct, order_index)
VALUES 
(@q5_id, '职员 (zhíyuán)', FALSE, 1),
(@q5_id, '姓名 (xìngmíng)', FALSE, 2),
(@q5_id, '总经理 (zǒngjīnglǐ)', TRUE, 3),
(@q5_id, '负责 (fùzé)', FALSE, 4);


-- Question 6 (Group 1 - Substitution MCQ 2):
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, meta_data, explanation)
VALUES (
    @quiz_1_id, 
    'MULTIPLE_CHOICE', 
    'Khách hàng cho biết họ phụ trách mảng tuyển dụng và quản lý nhân sự. Chọn bộ phận thích hợp hoàn thành câu: "请问，您是_____ của nhà máy?" (thực chất: "请问，您是_____的经理吗？")', 
    NULL, 
    10, 
    6, 
    NULL,
    '"人力资源部" (Phòng Nhân sự) là bộ phận chịu trách nhiệm tuyển dụng và quản lý nguồn nhân lực.'
);
SET @q6_id = LAST_INSERT_ID();

INSERT INTO answers (question_id, content, is_correct, order_index)
VALUES 
(@q6_id, '人力资源部 (rénlì zīyuán bù)', TRUE, 1),
(@q6_id, '软件部 (ruǎnjiàn bù)', FALSE, 2),
(@q6_id, '职务部 (zhíwù bù)', FALSE, 3),
(@q6_id, '名字部 (míngzǐ bù)', FALSE, 4);


-- Question 7 (Group 1 - Substitution MCQ 3):
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, meta_data, explanation)
VALUES (
    @quiz_1_id, 
    'MULTIPLE_CHOICE', 
    'Chọn động từ biểu thị việc nắm giữ một vai trò hoặc vị trí công vụ chính thức: "请问nắm giữ gì chức vụ?" (thực chất: "请问您在贵公司_____什么职务？")', 
    NULL, 
    10, 
    7, 
    NULL,
    'Cấu trúc kết hợp chuẩn mực trong tiếng Trung hành chính là "担任...职务" (đảm nhiệm chức vụ...).'
);
SET @q7_id = LAST_INSERT_ID();

INSERT INTO answers (question_id, content, is_correct, order_index)
VALUES 
(@q7_id, '称呼 (chēnghu)', FALSE, 1),
(@q7_id, '负责 (fùzé)', FALSE, 2),
(@q7_id, '担任 (dānrèn)', TRUE, 3),
(@q7_id, '名字 (míngzi)', FALSE, 4);


-- Question 8 (Group 1 - Substitution MCQ 4):
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, meta_data, explanation)
VALUES (
    @quiz_1_id, 
    'MULTIPLE_CHOICE', 
    'Khách hàng là một nữ nhân viên trẻ tuổi chưa lập gia đình. Chọn danh xưng lịch thiệp phù hợp nhất hoàn thành câu: "请问，这位 là phòng mua sắm bộ phận Trần_____。" (thực chất: "请问，这位sắp là采购部の陈_____。")', 
    NULL, 
    10, 
    8, 
    NULL,
    '"小姐" (Tiểu thư/Cô) là danh xưng trang nhã truyền thống dành cho phụ nữ trẻ tuổi trong giao tiếp công sở.'
);
SET @q8_id = LAST_INSERT_ID();

INSERT INTO answers (question_id, content, is_correct, order_index)
VALUES 
(@q8_id, '先生 (xiānshēng)', FALSE, 1),
(@q8_id, '小姐 (xiǎojiě)', TRUE, 2),
(@q8_id, '职务 (zhíwù)', FALSE, 3),
(@q8_id, '负责 (fùzé)', FALSE, 4);


-- Question 9 (Group 1 - Substitution MCQ 5):
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, meta_data, explanation)
VALUES (
    @quiz_1_id, 
    'MULTIPLE_CHOICE', 
    'Đối tác giới thiệu họ làm việc cho một cơ sở sản xuất quy mô lớn (Nhà máy). Chọn đơn vị phù hợp hoàn thành câu: "请问，您 là nhà máy này_____ người quản lý?" (thực chất: "请问，您是这家_____的管理者吗？")', 
    NULL, 
    10, 
    9, 
    NULL,
    '"工厂" (Nhà máy/Xưởng) là loại hình đơn vị sản xuất trực tiếp vật chất, tương ứng với vị trí Giám đốc nhà máy "厂长" (chǎngzhǎng).'
);
SET @q9_id = LAST_INSERT_ID();

INSERT INTO answers (question_id, content, is_correct, order_index)
VALUES 
(@q9_id, '称呼 (chēnghu)', FALSE, 1),
(@q9_id, '工厂 (gōngchǎng)', TRUE, 2),
(@q9_id, '名字 (míngzi)', FALSE, 3),
(@q9_id, '职务 (zhíwù)', FALSE, 4);


-- Question 10 (Group 1 - Substitution MCQ 6):
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, meta_data, explanation)
VALUES (
    @quiz_1_id, 
    'MULTIPLE_CHOICE', 
    'Doanh nghiệp đối tác hoạt động trong ngành dịch vụ Logistics/Vận tải. Chọn danh từ thích hợp thay thế hoàn thành câu: "Chúng tôi công ty chủ yếu phụ trách_____ nghiệp vụ。" (thực chất: "我们公司主要负责_____业务。")', 
    NULL, 
    10, 
    10, 
    NULL,
    '"物流" (Logistics/Vận tải) là mảng dịch vụ lưu thông hàng hóa phổ biến trong chuỗi cung ứng thương mại.'
);
SET @q10_id = LAST_INSERT_ID();

INSERT INTO answers (question_id, content, is_correct, order_index)
VALUES 
(@q10_id, '物流 (wùliú)', TRUE, 1),
(@q10_id, '职务 (zhíwù)', FALSE, 2),
(@q10_id, '称呼 (chēnghu)', FALSE, 3),
(@q10_id, '名字 (míngzi)', FALSE, 4);


-- Question 11 (Group 2 - Semantic & Phonetic MCQ 1):
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, meta_data, explanation)
VALUES (
    @quiz_1_id, 
    'MULTIPLE_CHOICE', 
    'Cho từ 职务 với phiên âm tương ứng là (zhíwù). Nghĩa tiếng Việt chuẩn xác nhất của từ này trong văn cảnh thương mại là gì?', 
    NULL, 
    10, 
    11, 
    NULL,
    '"职务" biểu thị vị trí công tác chính thức của một cá nhân trong tổ chức doanh nghiệp.'
);
SET @q11_id = LAST_INSERT_ID();

INSERT INTO answers (question_id, content, is_correct, order_index)
VALUES 
(@q11_id, 'Tên riêng dùng để gọi đối tác', FALSE, 1),
(@q11_id, 'Chức vụ, vị trí công tác được phân công', TRUE, 2),
(@q11_id, 'Tên gọi đầy đủ của một doanh nghiệp', FALSE, 3),
(@q11_id, 'Trách nhiệm bồi thường hợp đồng', FALSE, 4);


-- Question 12 (Group 2 - Semantic & Phonetic MCQ 2):
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, meta_data, explanation)
VALUES (
    @quiz_1_id, 
    'MULTIPLE_CHOICE', 
    'Từ chỉ chức danh quản lý cao nhất doanh nghiệp 总经理 có phiên âm Pinyin chính xác là gì?', 
    NULL, 
    10, 
    12, 
    NULL,
    'Phiên âm chuẩn theo hệ thống Bính âm quốc tế của chữ "总经理" là zǒng jīng lǐ.'
);
SET @q12_id = LAST_INSERT_ID();

INSERT INTO answers (question_id, content, is_correct, order_index)
VALUES 
(@q12_id, 'zhōng jīng lǐ', FALSE, 1),
(@q12_id, 'zōng jìn nǐ', FALSE, 2),
(@q12_id, 'zǒng jīng lǐ', TRUE, 3),
(@q12_id, 'zòng jǐng lǐ', FALSE, 4);


-- Question 13 (Group 2 - Semantic & Phonetic MCQ 3):
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, meta_data, explanation)
VALUES (
    @quiz_1_id, 
    'MULTIPLE_CHOICE', 
    'Trong câu "您目前负责哪个项目？", từ 负责 (fùzé) mang ý nghĩa nào dưới đây?', 
    NULL, 
    10, 
    13, 
    NULL,
    '"负责" (fùzé) là một động từ biểu thị hành vi chịu trách nhiệm chính trước một dự án hoặc bộ phận.'
);
SET @q13_id = LAST_INSERT_ID();

INSERT INTO answers (question_id, content, is_correct, order_index)
VALUES 
(@q13_id, 'Tìm kiếm thông tin khách hàng mới', FALSE, 1),
(@q13_id, 'Đảm nhiệm, chịu trách nhiệm phụ trách mảng công việc', TRUE, 2),
(@q13_id, 'Ký kết biên bản nghiệm thu dự án', FALSE, 3),
(@q13_id, 'Đánh giá hiệu quả làm việc của nhân viên', FALSE, 4);


-- Question 14 (Group 2 - Semantic & Phonetic MCQ 4):
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, meta_data, explanation)
VALUES (
    @quiz_1_id, 
    'MULTIPLE_CHOICE', 
    'Từ chỉ hành vi xưng hô trong giao tiếp 称呼 có phiên âm Pinyin đúng là gì?', 
    NULL, 
    10, 
    14, 
    NULL,
    'Từ "称呼" có âm đọc chuẩn xác là chēnghu (với âm thứ hai đọc thanh nhẹ).'
);
SET @q14_id = LAST_INSERT_ID();

INSERT INTO answers (question_id, content, is_correct, order_index)
VALUES 
(@q14_id, 'chènghū', FALSE, 1),
(@q14_id, 'chēnghu', TRUE, 2),
(@q14_id, 'chēnhú', FALSE, 3),
(@q14_id, 'shēnghǔ', FALSE, 4);


-- Question 15 (Group 2 - Semantic & Phonetic MCQ 5):
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, meta_data, explanation)
VALUES (
    @quiz_1_id, 
    'MULTIPLE_CHOICE', 
    'Cho hai từ 经理 (jīnglǐ) và 主管 (zhǔguǎn). Nhận định nào dưới đây phản ánh đúng sự khác biệt về vai trò quản lý của hai vị trí này?', 
    NULL, 
    10, 
    15, 
    NULL,
    'Trong cơ cấu doanh nghiệp Á Đông, "经理" biểu thị cấp quản lý bộ phận có quyền tự chủ lớn hơn so với "主管" - vị trí giám sát trực tiếp các đầu mục công việc nhỏ.'
);
SET @q15_id = LAST_INSERT_ID();

INSERT INTO answers (question_id, content, is_correct, order_index)
VALUES 
(@q15_id, '经理 là nhân viên thực thi trực tiếp, còn 主管 là người đứng đầu toàn bộ tập đoàn.', FALSE, 1),
(@q15_id, '经理 (Trưởng phòng/Giám đốc) có thẩm quyền ký kết quyết định lớn hơn, còn 主管 (Quản lý/Giám sát) thường điều hành hoạt động của một nhóm công việc cụ thể.', TRUE, 2),
(@q15_id, 'Hai từ này hoàn toàn đồng nghĩa và có thể thay thế cho nhau trong mọi văn cảnh hành chính.', FALSE, 3),
(@q15_id, '主管 là chức danh chỉ dùng cho người nước ngoài, còn 经理 chỉ dùng cho nhân sự bản xứ.', FALSE, 4);


-- Question 16 (Group 2 - Semantic & Phonetic MCQ 6):
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, meta_data, explanation)
VALUES (
    @quiz_1_id, 
    'MULTIPLE_CHOICE', 
    'Từ 软件 với phiên âm tương ứng là (ruǎnjiàn) mang ý nghĩa nào dưới đây?', 
    NULL, 
    10, 
    16, 
    NULL,
    '"软件" (ruǎnjiàn) là thuật ngữ chuyên ngành công nghệ thông tin chỉ phần mềm máy tính hoặc phần mềm ứng dụng, phân biệt với phần cứng "硬件" (yìnjiàn).'
);
SET @q16_id = LAST_INSERT_ID();

INSERT INTO answers (question_id, content, is_correct, order_index)
VALUES 
(@q16_id, 'Thiết bị phần cứng máy tính', FALSE, 1),
(@q16_id, 'Phần mềm công nghệ thông tin', TRUE, 2),
(@q16_id, 'Tài liệu hợp đồng bản cứng', FALSE, 3),
(@q16_id, 'Hệ thống mạng nội bộ công ty', FALSE, 4);
