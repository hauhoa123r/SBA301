-- 1. XÓA VÀ TẠO MỚI DATABASE
DROP DATABASE IF EXISTS chinese_online_learning;
CREATE DATABASE chinese_online_learning;
USE chinese_online_learning;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,exercises
    duration_months INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plan_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,           
    status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id INT NOT NULL,                
    title VARCHAR(255) NOT NULL,
    description TEXT,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE chapters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    `order` INT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE lessons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chapter_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    video_url VARCHAR(500),               
    `order` INT NOT NULL,              
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lesson_id INT NOT NULL,              
    title VARCHAR(255) NOT NULL,
    content_url VARCHAR(500),             
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type ENUM('mini_quiz', 'chapter_quiz') NOT NULL,
    lesson_id INT NULL,                    
    chapter_id INT NULL,                  
    pass_score INT NOT NULL DEFAULT 50,   
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE SET NULL,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    content TEXT NOT NULL,              
    points INT NOT NULL DEFAULT 10,       
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    content TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,    
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_quiz_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    quiz_id INT NOT NULL,
    score INT NOT NULL,                    
    is_passed BOOLEAN DEFAULT FALSE,    
    attempt_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_lesson_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    lesson_id INT NOT NULL,
    current_time_seconds INT DEFAULT 0,  
    is_completed BOOLEAN DEFAULT FALSE,   
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_lesson (user_id, lesson_id) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_exercise_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    exercise_id INT NOT NULL,
    file_submission_url VARCHAR(500),   
    status ENUM('submitted', 'reviewed') DEFAULT 'submitted',
    grade VARCHAR(10) NULL,            
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_chapter_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    chapter_id INT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_chapter (user_id, chapter_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thêm 10 Users với mật khẩu Sba12345
INSERT INTO users (full_name, email, password) VALUES
('Nguyễn Văn A', 'nguyenvana@gmail.com', 'Sba12345'),
('Trần Thị B', 'tranthib@gmail.com', 'Sba12345'),
('Lê Hoàng C', 'lehoangc@gmail.com', 'Sba12345'),
('Phạm Minh D', 'phamminhd@gmail.com', 'Sba12345'),
('Vũ Thị E', 'vuthie@gmail.com', 'Sba12345'),
('Đặng Văn F', 'dangvanf@gmail.com', 'Sba12345'),
('Hoàng Thị G', 'hoangthig@gmail.com', 'Sba12345'),
('Bùi Minh H', 'buiminhh@gmail.com', 'Sba12345'),
('Ngô Thanh I', 'ngothanhi@gmail.com', 'Sba12345'),
('Đỗ Hoàng K', 'dohoangk@gmail.com', 'Sba12345');

-- Thêm 3 Gói Học
INSERT INTO plans (name, duration_months, price) VALUES 
('Gói Học Pro 3 Tháng', 3, 499000),
('Gói Học Pro 6 Tháng', 6, 899000),
('Gói Học Pro 12 Tháng', 12, 1499000);

-- Thêm Lịch Sử Đăng Ký Gói Học
INSERT INTO user_subscriptions (user_id, plan_id, start_date, end_date, status) VALUES 
(1, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 3 MONTH), 'active'), 
(2, 2, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 6 MONTH), 'active'), 
(3, 3, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 12 MONTH), 'active'), 
(4, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 3 MONTH), 'active');

-- BỔ SUNG: Chèn 3 Khóa Học liên kết với 3 Gói Học trên
INSERT INTO courses (plan_id, title, description) VALUES
(1, 'Khóa Học Tiếng Trung Sơ Cấp (HSK 1 - HSK 2)', 'Khóa học dành cho người mới bắt đầu, làm quen với Pinyin và các mẫu câu cơ bản.'),
(2, 'Khóa Học Tiếng Trung Trung Cấp (HSK 3 - HSK 4)', 'Mở rộng vốn từ vựng, ngữ pháp phức tạp và luyện giao tiếp phản xạ.'),
(3, 'Khóa Học Tiếng Trung Cao Cấp (HSK 5 - HSK 6)', 'Luyện dịch thuật, viết luận và làm quen với tiếng Trung thương mại chuyên sâu.');

DELIMITER $$

DROP PROCEDURE IF EXISTS GenerateCourseStructure$$

CREATE PROCEDURE GenerateCourseStructure()
BEGIN
    DECLARE current_course_id INT;
    DECLARE current_chapter_id INT;
    DECLARE current_lesson_id INT;
    DECLARE current_quiz_id INT;
    DECLARE current_question_id INT;
    
    DECLARE c_idx INT DEFAULT 1;
    DECLARE ch_idx INT;
    DECLARE l_idx INT;
    DECLARE qn_idx INT;
    
    -- Lặp qua 3 Khóa học
    WHILE c_idx <= 3 DO
        SET current_course_id = c_idx;
        SET ch_idx = 1;
        WHILE ch_idx <= 10 DO
            INSERT INTO chapters (course_id, title, `order`) 
            VALUES (
                current_course_id, 
                CONCAT('Chương ', ch_idx, ': Nội dung nhóm ', ch_idx, ' - Khóa ', current_course_id), 
                ch_idx
            );
            SET current_chapter_id = LAST_INSERT_ID();
            SET l_idx = 1;
            WHILE l_idx <= 5 DO
                INSERT INTO lessons (chapter_id, title, video_url, `order`) 
                VALUES (
                    current_chapter_id, 
                    CONCAT('Bài ', l_idx, ': Bài giảng thực hành số ', l_idx), 
                    CONCAT('https://storage.learningchinese.edu/videos/course_', current_course_id, '_ch_', ch_idx, '_l_', l_idx, '.mp4'), 
                    l_idx
                );
                SET current_lesson_id = LAST_INSERT_ID();
                
                INSERT INTO exercises (lesson_id, title, content_url)
                VALUES (
                    current_lesson_id, 
                    CONCAT('Bài tập về nhà - Bài học ', l_idx), 
                    CONCAT('https://storage.learningchinese.edu/exercises/homework_lesson_', current_lesson_id, '.pdf')
                );
                INSERT INTO quizzes (title, type, lesson_id, chapter_id, pass_score)
                VALUES (
                    CONCAT('Mini Quiz - Kiểm tra Bài ', l_idx), 
                    'mini_quiz', 
                    current_lesson_id, 
                    NULL, 
                    60
                );
                SET current_quiz_id = LAST_INSERT_ID();
                
                -- Mỗi bài kiểm tra tự động tạo thêm 10 Câu hỏi (Questions)
                SET qn_idx = 1;
                WHILE qn_idx <= 10 DO
                    INSERT INTO questions (quiz_id, content, points)
                    VALUES (
                        current_quiz_id, 
                        CONCAT('Câu hỏi số ', qn_idx, ': Chọn đáp án chính xác nhất.'), 
                        10
                    );
                    SET current_question_id = LAST_INSERT_ID();
                    
                    -- Mỗi câu hỏi sinh 4 đáp án (Đáp án A luôn đúng)
                    INSERT INTO answers (question_id, content, is_correct) VALUES
                    (current_question_id, CONCAT('Đáp án A (Đúng) cho câu hỏi ', qn_idx), TRUE),
                    (current_question_id, CONCAT('Đáp án B (Sai) cho câu hỏi ', qn_idx), FALSE),
                    (current_question_id, CONCAT('Đáp án C (Sai) cho câu hỏi ', qn_idx), FALSE),
                    (current_question_id, CONCAT('Đáp án D (Sai) cho câu hỏi ', qn_idx), FALSE);
                    
                    SET qn_idx = qn_idx + 1;
                END WHILE;
                
                SET l_idx = l_idx + 1;
            END WHILE;
            
            SET ch_idx = ch_idx + 1;
        END WHILE;
        
        SET c_idx = c_idx + 1;
    END WHILE;
    
END$$

DELIMITER ;
CALL GenerateCourseStructure();
DROP PROCEDURE IF EXISTS GenerateCourseStructure;