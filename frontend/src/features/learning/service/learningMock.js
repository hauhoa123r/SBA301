const lessonVideo = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const makeQuiz = (id, lessonId, title, questions) => ({
    id,
    lesson_id: lessonId,
    chapter_id: null,
    title,
    type: "SINGLE_CHOICE",
    time_limit_minutes: 5,
    pass_score: 70,
    questions,
});

const answer = (id, content, is_correct = false) => ({ id, content, is_correct });

export const LEARNING_COURSES = [
    {
        id: 1,
        teacher_id: 2,
        category_id: 7,
        title: "Tieng Trung HSK 3",
        displayTitle: "Tiếng Trung HSK 3",
        teacherName: "Nguyễn Minh Hải",
        description: "Lộ trình HSK 3 gồm video bài học, trắc nghiệm sau từng bài học và bài tập tổng kết cuối mỗi chương.",
        thumbnail_url: "https://images.unsplash.com/photo-1528164344705-47542687000d?w=900&h=500&fit=crop&auto=format",
        status: "PUBLISHED",
        chapters: [
            {
                id: 101,
                course_id: 1,
                title: "Chào hỏi & Giới thiệu",
                description: "Học cách chào hỏi và tự giới thiệu bản thân bằng tiếng Trung.",
                order_index: 1,
                lessons: [
                    {
                        id: 1001,
                        chapter_id: 101,
                        title: "Nǐ hǎo - Xin chào",
                        video_url: lessonVideo,
                        duration_seconds: 480,
                        order_index: 1,
                        summary: "Nhận diện thanh điệu cơ bản, mẫu câu chào hỏi và cách đáp lại lịch sự.",
                        documents: [{ id: 1, title: "Từ vựng chào hỏi.pdf", file_url: "/documents/hsk3-greetings.pdf" }],
                        quiz: makeQuiz(5001, 1001, "Trắc nghiệm: Bài 1", [
                            {
                                id: 9001,
                                content: "'你好' có nghĩa là gì?",
                                points: 10,
                                order_index: 1,
                                answers: [
                                    answer(1, "Xin chào", true),
                                    answer(2, "Tạm biệt"),
                                    answer(3, "Cảm ơn"),
                                ],
                            },
                            {
                                id: 9002,
                                content: "Cách đọc đúng của 你 là gì?",
                                points: 10,
                                order_index: 2,
                                answers: [
                                    answer(4, "nǐ", true),
                                    answer(5, "wǒ"),
                                    answer(6, "tā"),
                                ],
                            },
                        ]),
                    },
                    {
                        id: 1002,
                        chapter_id: 101,
                        title: "Tên & Quốc tịch",
                        video_url: lessonVideo,
                        duration_seconds: 600,
                        order_index: 2,
                        summary: "Hỏi tên, nói quốc tịch và dùng mẫu câu 'Tôi là người...'.",
                        documents: [{ id: 2, title: "Mẫu câu giới thiệu.docx", file_url: "/documents/hsk3-introduction.docx" }],
                        quiz: makeQuiz(5002, 1002, "Trắc nghiệm: Bài 2", [
                            {
                                id: 9003,
                                content: "'我叫...' dùng để nói gì?",
                                points: 10,
                                order_index: 1,
                                answers: [
                                    answer(7, "Tôi tên là...", true),
                                    answer(8, "Tôi đi đến..."),
                                    answer(9, "Tôi thích..."),
                                ],
                            },
                        ]),
                    },
                    {
                        id: 1003,
                        chapter_id: 101,
                        title: "Số đếm 1-10",
                        video_url: lessonVideo,
                        duration_seconds: 720,
                        order_index: 3,
                        summary: "Luyện số đếm, hỏi tuổi và dùng số trong hội thoại ngắn.",
                        documents: [{ id: 3, title: "Bảng số đếm.pdf", file_url: "/documents/hsk3-numbers.pdf" }],
                        quiz: makeQuiz(5003, 1003, "Trắc nghiệm: Bài 3", [
                            {
                                id: 9004,
                                content: "Số 8 trong tiếng Trung là gì?",
                                points: 10,
                                order_index: 1,
                                answers: [
                                    answer(10, "bā", true),
                                    answer(11, "qī"),
                                    answer(12, "jiǔ"),
                                ],
                            },
                        ]),
                    },
                ],
                assignment: {
                    id: 7001,
                    lesson_id: 1003,
                    title: "Bài tập tổng kết chương 1",
                    description: "Viết đoạn hội thoại 6-8 câu: chào hỏi, giới thiệu tên, quốc tịch và tuổi.",
                    attachment_url: "/assignments/chapter-1-template.docx",
                    deadline_days: 3,
                },
            },
            {
                id: 102,
                course_id: 1,
                title: "Gia đình & Cuộc sống",
                description: "Từ vựng về gia đình, nhà ở và sinh hoạt hằng ngày.",
                order_index: 2,
                lessons: [
                    {
                        id: 1004,
                        chapter_id: 102,
                        title: "Thành viên gia đình",
                        video_url: lessonVideo,
                        duration_seconds: 540,
                        order_index: 1,
                        summary: "Gọi tên các thành viên gia đình và giới thiệu quan hệ thân thuộc.",
                        documents: [],
                        quiz: makeQuiz(5004, 1004, "Trắc nghiệm: Bài 4", [
                            {
                                id: 9005,
                                content: "'妈妈' nghĩa là gì?",
                                points: 10,
                                order_index: 1,
                                answers: [answer(13, "Mẹ", true), answer(14, "Bố"), answer(15, "Anh trai")],
                            },
                        ]),
                    },
                    {
                        id: 1005,
                        chapter_id: 102,
                        title: "Một ngày của tôi",
                        video_url: lessonVideo,
                        duration_seconds: 690,
                        order_index: 2,
                        summary: "Mô tả lịch sinh hoạt theo thời gian trong ngày.",
                        documents: [],
                        quiz: makeQuiz(5005, 1005, "Trắc nghiệm: Bài 5", [
                            {
                                id: 9006,
                                content: "'今天' nghĩa là gì?",
                                points: 10,
                                order_index: 1,
                                answers: [answer(16, "Hôm nay", true), answer(17, "Ngày mai"), answer(18, "Hôm qua")],
                            },
                        ]),
                    },
                ],
                assignment: {
                    id: 7002,
                    lesson_id: 1005,
                    title: "Bài tập tổng kết chương 2",
                    description: "Ghi âm hoặc viết phần giới thiệu gia đình và lịch sinh hoạt trong ngày.",
                    attachment_url: null,
                    deadline_days: 4,
                },
            },
            {
                id: 103,
                course_id: 1,
                title: "Mua sắm & Ẩm thực",
                description: "Giao tiếp khi mua sắm, gọi món và thanh toán.",
                order_index: 3,
                lessons: [
                    {
                        id: 1006,
                        chapter_id: 103,
                        title: "Hỏi giá",
                        video_url: lessonVideo,
                        duration_seconds: 510,
                        order_index: 1,
                        summary: "Dùng mẫu câu hỏi giá, số lượng và cách trả lời ngắn.",
                        documents: [],
                        quiz: makeQuiz(5006, 1006, "Trắc nghiệm: Bài 6", [
                            {
                                id: 9007,
                                content: "'多少钱' dùng để hỏi gì?",
                                points: 10,
                                order_index: 1,
                                answers: [answer(19, "Bao nhiêu tiền?", true), answer(20, "Ở đâu?"), answer(21, "Khi nào?")],
                            },
                        ]),
                    },
                    {
                        id: 1007,
                        chapter_id: 103,
                        title: "Gọi món",
                        video_url: lessonVideo,
                        duration_seconds: 570,
                        order_index: 2,
                        summary: "Gọi món ăn, đồ uống và nói khẩu vị cá nhân.",
                        documents: [],
                        quiz: makeQuiz(5007, 1007, "Trắc nghiệm: Bài 7", [
                            {
                                id: 9008,
                                content: "'茶' nghĩa là gì?",
                                points: 10,
                                order_index: 1,
                                answers: [answer(22, "Trà", true), answer(23, "Cơm"), answer(24, "Nước")],
                            },
                        ]),
                    },
                ],
                assignment: {
                    id: 7003,
                    lesson_id: 1007,
                    title: "Bài tập tổng kết chương 3",
                    description: "Soạn đoạn hội thoại mua món ăn, hỏi giá và thanh toán.",
                    attachment_url: null,
                    deadline_days: 3,
                },
            },
            {
                id: 104,
                course_id: 1,
                title: "Giao thông & Địa điểm",
                description: "Hỏi đường, nói phương tiện di chuyển và vị trí.",
                order_index: 4,
                lessons: [
                    {
                        id: 1008,
                        chapter_id: 104,
                        title: "Hỏi đường",
                        video_url: lessonVideo,
                        duration_seconds: 630,
                        order_index: 1,
                        summary: "Hỏi vị trí địa điểm và chỉ hướng cơ bản.",
                        documents: [],
                        quiz: makeQuiz(5008, 1008, "Trắc nghiệm: Bài 8", [
                            {
                                id: 9009,
                                content: "'在哪里' nghĩa là gì?",
                                points: 10,
                                order_index: 1,
                                answers: [answer(25, "Ở đâu?", true), answer(26, "Bao lâu?"), answer(27, "Bao nhiêu?")],
                            },
                        ]),
                    },
                    {
                        id: 1009,
                        chapter_id: 104,
                        title: "Đi bằng gì?",
                        video_url: lessonVideo,
                        duration_seconds: 660,
                        order_index: 2,
                        summary: "Nói về xe buýt, tàu điện, đi bộ và thời gian di chuyển.",
                        documents: [],
                        quiz: makeQuiz(5009, 1009, "Trắc nghiệm: Bài 9", [
                            {
                                id: 9010,
                                content: "'坐车' liên quan đến hành động nào?",
                                points: 10,
                                order_index: 1,
                                answers: [answer(28, "Đi xe", true), answer(29, "Ăn cơm"), answer(30, "Đọc sách")],
                            },
                        ]),
                    },
                ],
                assignment: {
                    id: 7004,
                    lesson_id: 1009,
                    title: "Bài tập tổng kết chương 4",
                    description: "Mô tả đường đi từ nhà đến trường bằng tối thiểu 8 câu.",
                    attachment_url: null,
                    deadline_days: 5,
                },
            },
            {
                id: 105,
                course_id: 1,
                title: "Ôn tập HSK 3",
                description: "Tổng hợp từ vựng, mẫu câu và luyện đề ngắn.",
                order_index: 5,
                lessons: [
                    {
                        id: 1010,
                        chapter_id: 105,
                        title: "Ôn tập từ vựng",
                        video_url: lessonVideo,
                        duration_seconds: 780,
                        order_index: 1,
                        summary: "Hệ thống lại nhóm từ vựng thường gặp trong HSK 3.",
                        documents: [],
                        quiz: makeQuiz(5010, 1010, "Trắc nghiệm: Bài 10", [
                            {
                                id: 9011,
                                content: "'学习' nghĩa là gì?",
                                points: 10,
                                order_index: 1,
                                answers: [answer(31, "Học tập", true), answer(32, "Mua sắm"), answer(33, "Du lịch")],
                            },
                        ]),
                    },
                    {
                        id: 1011,
                        chapter_id: 105,
                        title: "Luyện đề ngắn",
                        video_url: lessonVideo,
                        duration_seconds: 900,
                        order_index: 2,
                        summary: "Làm quen với nhịp độ câu hỏi và cách tự kiểm tra trước kỳ thi.",
                        documents: [],
                        quiz: makeQuiz(5011, 1011, "Trắc nghiệm: Bài 11", [
                            {
                                id: 9012,
                                content: "Mục tiêu chính của luyện đề là gì?",
                                points: 10,
                                order_index: 1,
                                answers: [answer(34, "Kiểm tra tổng hợp", true), answer(35, "Học bảng chữ cái"), answer(36, "Chỉ luyện phát âm")],
                            },
                        ]),
                    },
                ],
                assignment: {
                    id: 7005,
                    lesson_id: 1011,
                    title: "Bài tập tổng kết chương 5",
                    description: "Hoàn thành đề tổng hợp và nộp phần tự đánh giá điểm mạnh, điểm cần luyện thêm.",
                    attachment_url: null,
                    deadline_days: 7,
                },
            },
        ],
    },
];

export const getLearningCourse = (courseId = 1) =>
    LEARNING_COURSES.find((course) => course.id === Number(courseId)) || LEARNING_COURSES[0];

export const flattenLearningActivities = (course) =>
    course.chapters.flatMap((chapter) => [
        ...chapter.lessons.flatMap((lesson) => [
            { kind: "lesson", chapter, lesson, id: `lesson-${lesson.id}` },
            { kind: "quiz", chapter, lesson, quiz: lesson.quiz, id: `quiz-${lesson.quiz.id}` },
        ]),
        { kind: "assignment", chapter, assignment: chapter.assignment, id: `assignment-${chapter.assignment.id}` },
    ]);
