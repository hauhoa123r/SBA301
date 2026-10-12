package com.app.features.feedback;

import com.app.features.feedback.dto.FeedbackDto.*;
import com.app.features.feedback.model.*;
import com.app.features.feedback.model.FeedbackQuestion.Type;
import com.app.features.feedback.repository.FeedbackFormRepository;
import com.app.features.feedback.service.FeedbackService;
import com.app.security.support.InMemoryDatabaseGuard;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.*;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.test.context.*;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest(showSql = false)
@ActiveProfiles("security-test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ContextConfiguration(classes = FeedbackIntegrationTest.Config.class, initializers = InMemoryDatabaseGuard.class)
class FeedbackIntegrationTest {
    @Configuration @EnableAutoConfiguration @EntityScan(basePackageClasses = FeedbackForm.class)
    @EnableJpaRepositories(basePackageClasses = FeedbackFormRepository.class) @Import(FeedbackService.class)
    static class Config {}
    @Autowired FeedbackService service;
    @Autowired EntityManager em;
    @Autowired FeedbackFormRepository forms;
    @BeforeEach void seedLock() { var gate = new FeedbackPublicationLock(); gate.setId(1); em.persist(gate); em.flush(); }

    @Test void fullLifecycleStoresAnswersAndCalculatesActualStatistics() {
        var form = publish(create(false, List.of(q(Type.MULTIPLE_CHOICE, true), q(Type.LIKERT, true), q(Type.NUMBER, true), q(Type.LONG_TEXT, false))));
        var qs = form.questions(); Long id = form.id();
        service.start(new Start(id, form.revision()), 3L);
        service.submit(new Submit(id, form.revision(), List.of(
            choice(qs.get(0), 0, 1), number(qs.get(1), "1"), number(qs.get(2), "2"), text(qs.get(3), "Góp ý một"))), 1L);
        service.submit(new Submit(id, form.revision(), List.of(
            choice(qs.get(0), 1), number(qs.get(1), "5"), number(qs.get(2), "8"), text(qs.get(3), "Góp ý hai"))), 2L);
        service.submit(new Submit(id, form.revision(), List.of(choice(qs.get(0), 0), number(qs.get(1), "3"), number(qs.get(2), "5"))), 1L);
        em.flush(); em.clear();
        var stats = service.statistics(id);
        assertEquals(3, stats.submissions()); assertEquals(2, stats.participants()); assertEquals(3, stats.startedUsers());
        assertEquals(200.0 / 3, stats.completionRate(), .001); assertEquals(11, stats.validAnswers());
        assertEquals(List.of(2L, 2L), stats.questions().get(0).distribution().stream().map(Bucket::count).toList());
        assertEquals(3.0, stats.questions().get(1).numeric().average()); assertEquals(3.0, stats.questions().get(1).numeric().median());
        assertEquals(5.0, stats.questions().get(2).numeric().average()); assertEquals(5.0, stats.questions().get(2).numeric().median());
        assertEquals(2, service.textAnswers(id, qs.get(3).id(), 0).totalElements());
        assertTrue(service.current(1L).hasSubmitted());
    }
    @Test void onlyOnePublishedRoundIncludingScheduledRoundsAndSwitchKeepsHistory() {
        var first = publish(create(true, List.of(q(Type.SHORT_TEXT, true))));
        service.submit(new Submit(first.id(), first.revision(), List.of(text(first.questions().get(0), "Lịch sử"))), 1L);
        var next = create(true, List.of(q(Type.SHORT_TEXT, true)));
        assertStatus(409, () -> publish(next));
        service.changeState(first.id(), new State(first.revision(), "CLOSE"));
        var published = publish(next); assertEquals(published.id(), service.current(null).id());
        assertEquals(1, service.statistics(first.id()).submissions());
    }
    @Test void rejectsDuplicateSingleSubmissionButAllowsAnotherUser() {
        var form = publish(create(true, List.of(q(Type.SHORT_TEXT, true))));
        var submit = new Submit(form.id(), form.revision(), List.of(text(form.questions().get(0), "Phản hồi")));
        service.submit(submit, 1L); assertStatus(409, () -> service.submit(submit, 1L)); service.submit(submit, 2L);
        assertEquals(2, service.statistics(form.id()).submissions());
    }
    @Test void rejectsMissingRequiredForeignOptionsDuplicateQuestionsAndInvalidNumbersBeforeWriting() {
        var form = publish(create(false, List.of(q(Type.SINGLE_CHOICE, true), q(Type.NUMBER, true), q(Type.LIKERT, true))));
        var qs = form.questions();
        assertStatus(400, () -> service.submit(new Submit(form.id(), form.revision(), List.of()), 1L));
        assertStatus(400, () -> service.submit(new Submit(form.id(), form.revision(), List.of(new Answer(qs.get(0).id(), null, null, List.of(99999L)), number(qs.get(1), "2"), number(qs.get(2), "3"))), 1L));
        assertStatus(400, () -> service.submit(new Submit(form.id(), form.revision(), List.of(choice(qs.get(0), 0), choice(qs.get(0), 1))), 1L));
        for (String value : List.of("-1", "11", "1.12345")) assertStatus(400, () -> service.submit(new Submit(form.id(), form.revision(), List.of(choice(qs.get(0), 0), number(qs.get(1), value), number(qs.get(2), "3"))), 1L));
        assertStatus(400, () -> service.submit(new Submit(form.id(), form.revision(), List.of(choice(qs.get(0), 0), number(qs.get(1), "2"), number(qs.get(2), "2.5"))), 1L));
        assertEquals(0, service.statistics(form.id()).submissions()); assertEquals(0, service.statistics(form.id()).validAnswers());
    }
    @Test void pausedClosedScheduledExpiredAndStaleFormsRejectSubmission() {
        var form = publish(create(true, List.of(q(Type.SHORT_TEXT, true))));
        var submit = new Submit(form.id(), form.revision(), List.of(text(form.questions().get(0), "Phản hồi")));
        service.changeState(form.id(), new State(form.revision(), "PAUSE")); assertNull(service.current(null)); assertStatus(409, () -> service.submit(submit, 1L));
        var paused = service.get(form.id()); var reopened = publish(paused); assertStatus(409, () -> service.submit(submit, 1L));
        var row = em.find(FeedbackForm.class, reopened.id()); row.setStartsAt(Instant.now().plusSeconds(600)); em.flush();
        assertNull(service.current(null)); assertStatus(409, () -> service.submit(new Submit(reopened.id(), reopened.revision(), submit.answers()), 1L));
        row.setStartsAt(null); row.setEndsAt(Instant.now().minusSeconds(1)); em.flush();
        assertNull(service.current(null)); assertStatus(409, () -> service.submit(new Submit(reopened.id(), reopened.revision(), submit.answers()), 1L));
        var next = publish(create(true, List.of(q(Type.SHORT_TEXT, true)))); assertEquals("CLOSED", service.get(row.getId()).status()); assertEquals(next.id(), service.current(null).id());
    }
    @Test void freezesSubmittedSchemaAndSingleSubmissionPolicyButAllowsMetadata() {
        var form = publish(create(true, List.of(q(Type.SHORT_TEXT, true))));
        service.submit(new Submit(form.id(), form.revision(), List.of(text(form.questions().get(0), "Câu trả lời cũ"))), 1L);
        var paused = service.changeState(form.id(), new State(form.revision(), "PAUSE"));
        assertStatus(409, () -> service.update(form.id(), new Save(paused.revision(), "Mới", "", true, null, null, List.of(q(Type.NUMBER, true)))));
        assertStatus(409, () -> service.update(form.id(), new Save(paused.revision(), "Mới", "", false, null, null, paused.questions())));
        var changed = service.update(form.id(), new Save(paused.revision(), "Tiêu đề mới", "Mô tả mới", true, null, null, paused.questions()));
        assertEquals(paused.questions(), changed.questions()); assertEquals("Câu trả lời cũ", service.textAnswers(form.id(), changed.questions().get(0).id(), 0).content().get(0).text());
    }
    @Test void databaseRejectsTwoActiveSlotsEvenWhenBypassingPublicationService() {
        publish(create(true, List.of(q(Type.SHORT_TEXT, true))));
        var illegal = new FeedbackForm(); illegal.setTitle("Bypass"); illegal.setStatus("PUBLISHED"); illegal.setActiveSlot(1);
        assertThrows(org.springframework.dao.DataIntegrityViolationException.class, () -> forms.saveAndFlush(illegal));
    }
    @Test void databaseRejectsRepeatedSingleUserGuardEvenWhenBypassingService() {
        var form = publish(create(true, List.of(q(Type.SHORT_TEXT, true))));
        service.submit(new Submit(form.id(), form.revision(), List.of(text(form.questions().get(0), "Một lần"))), 1L);
        var illegal = new FeedbackSubmission(); illegal.setForm(em.find(FeedbackForm.class, form.id())); illegal.setUserId(1L); illegal.setSingleUserId(1L);
        assertThrows(jakarta.persistence.PersistenceException.class, () -> { em.persist(illegal); em.flush(); });
    }
    @Test void textAnswerPaginationIsStableAndBelongsToTheRequestedForm() {
        var form = publish(create(false, List.of(q(Type.LONG_TEXT, true))));
        for (int i = 0; i < 23; i++) service.submit(new Submit(form.id(), form.revision(), List.of(text(form.questions().get(0), "Góp ý " + i))), 1L);
        var first = service.textAnswers(form.id(), form.questions().get(0).id(), 0); var second = service.textAnswers(form.id(), form.questions().get(0).id(), 1);
        assertEquals(20, first.content().size()); assertEquals(3, second.content().size()); assertEquals(2, first.totalPages());
        var another = create(false, List.of(q(Type.LONG_TEXT, true)));
        assertStatus(404, () -> service.textAnswers(another.id(), form.questions().get(0).id(), 0));
    }
    @Test void emptyStatisticsDoNotInventResponsesOrNumericMeasures() {
        var form = create(false, List.of(q(Type.NUMBER, true), q(Type.LIKERT, true)));
        var stats = service.statistics(form.id()); assertEquals(0, stats.submissions()); assertEquals(0, stats.completionRate());
        assertNull(stats.questions().get(0).numeric()); assertEquals(5, stats.questions().get(1).distribution().size());
    }
    @Test void editsUnansweredDraftAndReplacesOptionsWithoutLeavingOldQuestions() {
        var form = create(true, List.of(q(Type.SINGLE_CHOICE, true)));
        var oldQuestionId = form.questions().get(0).id();
        var updated = service.update(form.id(), new Save(form.revision(), "Biểu mẫu mới", "", false, null, null, List.of(q(Type.DROPDOWN, true), q(Type.YES_NO, false))));
        em.flush(); em.clear();
        assertNull(em.find(FeedbackQuestion.class, oldQuestionId)); assertEquals(2, service.get(form.id()).questions().size());
        var open = publish(updated);
        service.submit(new Submit(open.id(), open.revision(), List.of(choice(open.questions().get(0), 1), choice(open.questions().get(1), 0))), 1L);
        assertEquals(2, service.statistics(form.id()).validAnswers());
    }
    @Test void rejectsTooLongTextWrongValueTypeRepeatedOptionsAndChoiceCardinality() {
        var shortText = q(Type.SHORT_TEXT, true);
        shortText = new Question(null, shortText.title(), "", shortText.type(), true, null, null, 3, null, null, List.of());
        var multi = q(Type.MULTIPLE_CHOICE, true);
        multi = new Question(null, multi.title(), "", multi.type(), true, null, null, null, 2, 2, multi.options());
        var form = publish(create(false, List.of(shortText, multi)));
        var qs = form.questions();
        assertStatus(400, () -> service.submit(new Submit(form.id(), form.revision(), List.of(text(qs.get(0), "abcd"), choice(qs.get(1), 0, 1))), 1L));
        assertStatus(400, () -> service.submit(new Submit(form.id(), form.revision(), List.of(number(qs.get(0), "2"), choice(qs.get(1), 0, 1))), 1L));
        assertStatus(400, () -> service.submit(new Submit(form.id(), form.revision(), List.of(text(qs.get(0), "abc"), choice(qs.get(1), 0))), 1L));
        assertStatus(400, () -> service.submit(new Submit(form.id(), form.revision(), List.of(text(qs.get(0), "abc"), choice(qs.get(1), 0, 0))), 1L));
        assertEquals(0, service.statistics(form.id()).submissions());
    }
    @Test void configuredRatingHasDistributionAndEvenMedianAndFrozenNumericSchemaCanSave() {
        var form = publish(create(true, List.of(q(Type.RATING, true))));
        var question = form.questions().get(0);
        service.submit(new Submit(form.id(), form.revision(), List.of(number(question, "2"))), 1L);
        service.submit(new Submit(form.id(), form.revision(), List.of(number(question, "8"))), 2L);
        var stats = service.statistics(form.id()); assertEquals(5, stats.questions().get(0).numeric().median()); assertEquals(11, stats.questions().get(0).distribution().size());
        var paused = service.changeState(form.id(), new State(form.revision(), "PAUSE"));
        assertTrue(service.update(form.id(), new Save(paused.revision(), "Mới", "", true, null, null, paused.questions())).schemaLocked());
    }
    @Test void scheduledPublicationReservesTheSingleSlotBeforeItsStartDate() {
        var scheduled = service.create(new Save(null, "Đặt lịch", "", true, Instant.now().plusSeconds(3600), Instant.now().plusSeconds(7200), List.of(q(Type.SHORT_TEXT, true))));
        publish(scheduled); assertNull(service.current(null)); assertStatus(409, () -> publish(create(true, List.of(q(Type.SHORT_TEXT, true)))));
    }
    private Form create(boolean single, List<Question> questions) { return service.create(new Save(null, "Khảo sát", "Mô tả", single, null, null, questions)); }
    private Form publish(Form form) { return service.changeState(form.id(), new State(form.revision(), "PUBLISH")); }
    private Question q(Type type, boolean required) {
        List<Option> options = type == Type.LIKERT ? List.of(new Option(null, "1"), new Option(null, "2"), new Option(null, "3"), new Option(null, "4"), new Option(null, "5"))
            : Set.of(Type.SINGLE_CHOICE, Type.MULTIPLE_CHOICE, Type.DROPDOWN, Type.YES_NO).contains(type) ? List.of(new Option(null, "A"), new Option(null, "B")) : List.of();
        return new Question(null, "Câu hỏi " + type, "", type, required,
            type == Type.NUMBER || type == Type.RATING ? BigDecimal.ZERO : null, type == Type.NUMBER || type == Type.RATING ? BigDecimal.TEN : null, null, null, null, options);
    }
    private Answer text(Question q, String text) { return new Answer(q.id(), text, null, List.of()); }
    private Answer number(Question q, String value) { return new Answer(q.id(), null, new BigDecimal(value), List.of()); }
    private Answer choice(Question q, int... indices) { return new Answer(q.id(), null, null, Arrays.stream(indices).mapToObj(i -> q.options().get(i).id()).toList()); }
    private void assertStatus(int status, Runnable action) { assertEquals(status, assertThrows(ResponseStatusException.class, action::run).getStatusCode().value()); }
}
