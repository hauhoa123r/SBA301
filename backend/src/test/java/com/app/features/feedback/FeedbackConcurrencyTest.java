package com.app.features.feedback;

import com.app.features.feedback.dto.FeedbackDto.*;
import com.app.features.feedback.model.*;
import com.app.features.feedback.model.FeedbackQuestion.Type;
import com.app.features.feedback.service.FeedbackService;
import com.app.security.support.InMemoryDatabaseGuard;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.*;
import org.springframework.transaction.*;
import org.springframework.transaction.annotation.*;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest(showSql = false, properties = "spring.datasource.url=jdbc:h2:mem:feedbackconcurrency;MODE=MySQL;DB_CLOSE_DELAY=-1;INIT=CREATE SCHEMA IF NOT EXISTS chinese_online_learning")
@ActiveProfiles("security-test") @AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ContextConfiguration(classes = FeedbackIntegrationTest.Config.class, initializers = InMemoryDatabaseGuard.class)
@Transactional(propagation = Propagation.NOT_SUPPORTED)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class FeedbackConcurrencyTest {
    @Autowired FeedbackService service;
    @Autowired EntityManager em;
    @Autowired PlatformTransactionManager transactions;
    @BeforeEach void gate() { new TransactionTemplate(transactions).executeWithoutResult(tx -> { var gate = new FeedbackPublicationLock(); gate.setId(1); em.persist(gate); }); }
    @Test void simultaneousSingleUserSubmissionsCommitOnlyOnce() throws Exception {
        var form = publish(create(true)); var submit = new Submit(form.id(), form.revision(), List.of(new Answer(form.questions().get(0).id(), "Phản hồi", null, List.of())));
        assertEquals(List.of(201, 409), race(() -> service.submit(submit, 1L), () -> service.submit(submit, 1L)));
        assertEquals(1, service.statistics(form.id()).submissions()); assertEquals(1, service.statistics(form.id()).validAnswers());
    }
    @Test void simultaneousPublicationOfDifferentRoundsHasOneWinner() throws Exception {
        var first = create(true); var second = create(true);
        assertEquals(List.of(201, 409), race(() -> publish(first), () -> publish(second)));
        assertNotNull(service.current(null)); assertEquals(1, service.list(0).content().stream().filter(f -> f.status().equals("PUBLISHED")).count());
    }
    @Test void simultaneousRepeatableSubmissionsBothCommitWithoutDuplicateVisits() throws Exception {
        var form = publish(create(false)); var submit = new Submit(form.id(), form.revision(), List.of(new Answer(form.questions().get(0).id(), "Phản hồi", null, List.of())));
        assertEquals(List.of(201, 201), race(() -> service.submit(submit, 1L), () -> service.submit(submit, 1L)));
        var stats = service.statistics(form.id()); assertEquals(2, stats.submissions()); assertEquals(1, stats.participants()); assertEquals(1, stats.startedUsers());
    }
    private List<Integer> race(Runnable first, Runnable second) throws Exception {
        var ready = new CountDownLatch(2); var start = new CountDownLatch(1); var pool = Executors.newFixedThreadPool(2);
        try {
            var futures = List.of(first, second).stream().map(task -> pool.submit(() -> {
                ready.countDown(); assertTrue(start.await(10, TimeUnit.SECONDS));
                try { task.run(); return 201; } catch (ResponseStatusException ex) { return ex.getStatusCode().value(); }
            })).toList();
            assertTrue(ready.await(10, TimeUnit.SECONDS)); start.countDown();
            return List.of(futures.get(0).get(20, TimeUnit.SECONDS), futures.get(1).get(20, TimeUnit.SECONDS)).stream().sorted().toList();
        } finally { start.countDown(); pool.shutdownNow(); }
    }
    private Form create(boolean single) {
        return service.create(new Save(null, "Đợt đồng thời", "", single, null, null,
            List.of(new Question(null, "Góp ý", "", Type.SHORT_TEXT, true, null, null, null, null, null, List.of()))));
    }
    private Form publish(Form form) { return service.changeState(form.id(), new State(form.revision(), "PUBLISH")); }
}
