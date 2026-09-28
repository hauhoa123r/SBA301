package com.app.features.courses.repository;

import com.app.features.model.ChapterEntity;
import com.app.features.model.CourseEnrollmentEntity;
import com.app.features.model.CourseEntity;
import com.app.features.model.UserEntity;
import com.app.features.model.enums.CourseStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

// Requires a MySQL schema initialized from database/chinese_online_learning.sql.
// Test fixtures are rolled back by DataJpaTest; no schema or seed scripts run here.
@DataJpaTest(properties = {"spring.jpa.hibernate.ddl-auto=none", "spring.jpa.show-sql=false"})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@EnabledIfEnvironmentVariable(named = "RUN_MYSQL_INTEGRATION_TESTS", matches = "true")
class CourseRepositoryIntegrationTest {
    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ICourseRepository repository;

    private Long courseId;
    private List<Long> chapterIds;

    @BeforeEach
    void createCourseWithTwoChaptersAndTwoEnrollments() {
        UserEntity teacher = user();
        CourseEntity course = new CourseEntity();
        course.setTitle("Repository regression fixture");
        course.setTeacher(teacher);
        course.setStatus(CourseStatus.PUBLISHED);
        for (int order = 1; order <= 2; order++) {
            ChapterEntity chapter = new ChapterEntity();
            chapter.setTitle("Chapter " + order);
            chapter.setOrderIndex(order);
            course.addChapter(chapter);
        }
        entityManager.persist(course);
        for (int i = 0; i < 2; i++) {
            CourseEnrollmentEntity enrollment = new CourseEnrollmentEntity();
            enrollment.setCourse(course);
            enrollment.setUser(user());
            entityManager.persist(enrollment);
        }
        entityManager.flush();
        courseId = course.getId();
        chapterIds = course.getChapterEntities().stream().map(ChapterEntity::getId).sorted().toList();
        entityManager.clear();
    }

    @Test
    void detailQueryReturnsEachChapterOnceWhenMultipleStudentsAreEnrolled() {
        assertCourseContent(repository.findByIdAndStatus(courseId, CourseStatus.PUBLISHED).orElseThrow());
    }

    @Test
    void learningQueryReturnsEachChapterOnceWhenMultipleStudentsAreEnrolled() {
        assertCourseContent(repository.findById(courseId).orElseThrow());
    }

    private void assertCourseContent(CourseEntity course) {
        assertEquals(chapterIds, course.getChapterEntities().stream().map(ChapterEntity::getId).sorted().toList());
        assertEquals(2, course.getCourseEnrollments().size());
    }

    private UserEntity user() {
        UserEntity user = new UserEntity();
        user.setFullName("Repository test user");
        user.setEmail("repository-" + UUID.randomUUID() + "@example.test");
        user.setPasswordHash("unused-test-password-hash");
        return entityManager.persist(user);
    }
}
