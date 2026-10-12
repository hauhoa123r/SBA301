package com.app.features.feedback.service;

import com.app.features.feedback.dto.FeedbackDto.*;
import com.app.features.feedback.model.*;
import com.app.features.feedback.model.FeedbackQuestion.Type;
import com.app.features.feedback.repository.FeedbackFormRepository;
import jakarta.persistence.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

@Service @RequiredArgsConstructor @Transactional(readOnly = true)
public class FeedbackService {
    private final FeedbackFormRepository forms;
    private final EntityManager em;

    public Form current(Long userId) {
        return forms.findByActiveSlot(1).filter(this::isOpen).map(f -> view(f, userId)).orElse(null);
    }
    public Form get(Long id) { return view(find(id), null); }
    public FormPage list(int page) {
        checkPage(page);
        var result = forms.findAll(PageRequest.of(page, 50, Sort.by(Sort.Order.desc("activeSlot"), Sort.Order.desc("createdAt"), Sort.Order.desc("id"))));
        return new FormPage(result.map(f -> new Summary(f.getId(), f.getTitle(), f.getStatus(), isOpen(f), f.getCreatedAt(), submissionCount(f.getId()))).getContent(),
            result.getTotalElements(), result.getTotalPages(), page);
    }

    @Transactional
    public Form create(Save body) {
        validateForm(body);
        var f = new FeedbackForm(); applyMetadata(f, body); replaceQuestions(f, body.questions());
        forms.saveAndFlush(f);
        return view(f, null);
    }

    @Transactional
    public Form update(Long id, Save body) {
        var f = lock(id); revision(f, body.revision());
        if (!Set.of("DRAFT", "PAUSED").contains(f.getStatus())) conflict("Chỉ chỉnh sửa bản nháp hoặc đợt đang tạm dừng.");
        validateForm(body);
        if (submissionCount(id) > 0) {
            if (f.isOnePerUser() != body.onePerUser() || !sameSchema(f, body.questions()))
                conflict("Đợt đã có phản hồi: không thể thay đổi câu hỏi, phương án hoặc quy định số lần gửi. Hãy tạo đợt mới.");
        } else {
            f.getQuestions().clear(); em.flush(); replaceQuestions(f, body.questions());
        }
        applyMetadata(f, body); f.setRevision(f.getRevision() + 1); em.flush();
        return view(f, null);
    }

    @Transactional
    public Form changeState(Long id, State body) {
        // Always acquire the singleton before any form lock to avoid cross-publication deadlocks.
        if (em.find(FeedbackPublicationLock.class, 1, LockModeType.PESSIMISTIC_WRITE) == null)
            throw new IllegalStateException("Feedback migration has not seeded the publication lock.");
        var existing = forms.findByActiveSlot(1);
        if (existing.isPresent() && !existing.get().getId().equals(id)) {
            var previous = lock(existing.get().getId());
            if ("PUBLISH".equals(body.action())) {
                if (previous.getEndsAt() == null || Instant.now().isBefore(previous.getEndsAt()))
                    conflict("Một đợt khác đang được công khai hoặc chờ ngày mở. Hãy tạm dừng hoặc đóng đợt đó trước.");
                previous.setStatus("CLOSED"); previous.setActiveSlot(null); previous.setClosedAt(previous.getEndsAt());
                previous.setRevision(previous.getRevision() + 1); em.flush();
            }
        }
        var f = lock(id); revision(f, body.revision());
        switch (body.action()) {
            case "PUBLISH" -> {
                if (!Set.of("DRAFT", "PAUSED").contains(f.getStatus())) conflict("Chỉ xuất bản bản nháp hoặc đợt tạm dừng.");
                if (f.getQuestions().isEmpty()) bad("Cần ít nhất một câu hỏi trước khi xuất bản.");
                if (f.getEndsAt() != null && !Instant.now().isBefore(f.getEndsAt())) bad("Thời gian kết thúc đã qua.");
                f.setStatus("PUBLISHED"); f.setActiveSlot(1);
                if (f.getPublishedAt() == null) f.setPublishedAt(Instant.now());
            }
            case "PAUSE" -> {
                if (!"PUBLISHED".equals(f.getStatus())) conflict("Chỉ tạm dừng đợt đang xuất bản.");
                f.setStatus("PAUSED"); f.setActiveSlot(null);
            }
            case "CLOSE" -> {
                if ("CLOSED".equals(f.getStatus())) conflict("Đợt đã đóng.");
                f.setStatus("CLOSED"); f.setActiveSlot(null); f.setClosedAt(Instant.now());
            }
            default -> bad("Thao tác trạng thái không hợp lệ.");
        }
        f.setRevision(f.getRevision() + 1); em.flush(); return view(f, null);
    }

    @Transactional
    public void start(Start body, Long userId) {
        var f = lock(body.formId()); revision(f, body.revision()); requireOpen(f); visit(f.getId(), userId);
    }

    @Transactional
    public Receipt submit(Submit body, Long userId) {
        // The form row serializes edits, state changes and submissions, including duplicate checks.
        var f = lock(body.formId()); revision(f, body.revision()); requireOpen(f);
        if (f.isOnePerUser() && hasSubmitted(f.getId(), userId)) conflict("Bạn đã hoàn thành khảo sát này.");
        Map<Long, Answer> answers = new HashMap<>();
        Set<Long> questionIds = new HashSet<>(); f.getQuestions().forEach(q -> questionIds.add(q.getId()));
        for (var a : body.answers()) {
            if (!questionIds.contains(a.questionId()) || answers.put(a.questionId(), a) != null) bad("Câu hỏi không hợp lệ hoặc bị lặp.");
        }
        var submission = new FeedbackSubmission(); submission.setForm(f); submission.setUserId(userId);
        submission.setSingleUserId(f.isOnePerUser() ? userId : null);
        List<FeedbackAnswer> validated = new ArrayList<>();
        for (var q : f.getQuestions()) {
            var a = validateAnswer(q, answers.get(q.getId()));
            if (a != null) { a.setSubmission(submission); validated.add(a); }
        }
        if (validated.isEmpty()) bad("Vui lòng trả lời ít nhất một câu hỏi.");
        visit(f.getId(), userId); em.persist(submission); validated.forEach(em::persist); em.flush();
        return new Receipt(submission.getId(), submission.getSubmittedAt());
    }

    public Statistics statistics(Long id) {
        var f = find(id);
        long submissions = submissionCount(id);
        long participants = count("select count(distinct s.userId) from FeedbackSubmission s where s.form.id = :id", id);
        long started = count("select count(v) from FeedbackVisit v where v.formId = :id", id);
        long valid = count("select count(a) from FeedbackAnswer a where a.question.form.id = :id", id);
        List<QuestionStats> questions = new ArrayList<>();
        for (var q : f.getQuestions()) {
            long answered = count("select count(a) from FeedbackAnswer a where a.question.id = :id", q.getId());
            List<Bucket> buckets = new ArrayList<>(); Numeric numeric = null;
            if (choice(q.getType())) {
                Map<Long, Long> counts = new HashMap<>();
                for (var row : em.createQuery("select o.id, count(a) from FeedbackAnswer a join a.options o where a.question.id = :id group by o.id", Object[].class)
                        .setParameter("id", q.getId()).getResultList()) counts.put((Long) row[0], (Long) row[1]);
                for (var o : q.getOptions()) { long n = counts.getOrDefault(o.getId(), 0L); buckets.add(new Bucket(o.getLabel(), n, percent(n, answered))); }
            } else if (numeric(q.getType())) {
                if (answered > 0) {
                    var measures = em.createQuery("select avg(a.numberValue), min(a.numberValue), max(a.numberValue) from FeedbackAnswer a where a.question.id = :id", Object[].class)
                        .setParameter("id", q.getId()).getSingleResult();
                    // Fetch only the middle one/two values instead of every numeric answer.
                    var middle = em.createQuery("select a.numberValue from FeedbackAnswer a where a.question.id = :id order by a.numberValue", BigDecimal.class)
                        .setParameter("id", q.getId()).setFirstResult(Math.toIntExact((answered - 1) / 2)).setMaxResults(answered % 2 == 0 ? 2 : 1).getResultList();
                    numeric = new Numeric(((Number) measures[0]).doubleValue(), middle.stream().mapToDouble(BigDecimal::doubleValue).average().orElseThrow(),
                        ((Number) measures[1]).doubleValue(), ((Number) measures[2]).doubleValue());
                }
                if (q.getType() != Type.NUMBER) {
                    Map<Integer, Long> counts = new HashMap<>();
                    for (var row : em.createQuery("select a.numberValue, count(a) from FeedbackAnswer a where a.question.id = :id group by a.numberValue", Object[].class)
                            .setParameter("id", q.getId()).getResultList()) counts.put(((BigDecimal) row[0]).intValueExact(), (Long) row[1]);
                    int min = q.getType() == Type.LIKERT ? 1 : q.getMinValue().intValueExact();
                    int max = q.getType() == Type.LIKERT ? 5 : q.getMaxValue().intValueExact();
                    for (int v = min; v <= max; v++) {
                        long n = counts.getOrDefault(v, 0L);
                        String label = q.getType() == Type.LIKERT ? v + " · " + q.getOptions().get(v - 1).getLabel() : String.valueOf(v);
                        buckets.add(new Bucket(label, n, percent(n, answered)));
                    }
                }
            }
            questions.add(new QuestionStats(q.getId(), q.getTitle(), q.getType(), answered, buckets, numeric));
        }
        return new Statistics(view(f, null), submissions, participants, started, percent(participants, started), f.getQuestions().size(), valid, questions);
    }

    public TextPage textAnswers(Long formId, Long questionId, int page) {
        checkPage(page);
        var q = find(formId).getQuestions().stream().filter(x -> x.getId().equals(questionId)).findFirst()
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy câu hỏi."));
        if (!text(q.getType())) bad("Chỉ xem danh sách văn bản cho câu hỏi văn bản.");
        long total = count("select count(a) from FeedbackAnswer a where a.question.id = :id", questionId);
        var rows = em.createQuery("select a from FeedbackAnswer a join fetch a.submission s where a.question.id = :id order by s.submittedAt desc, a.id desc", FeedbackAnswer.class)
            .setParameter("id", questionId).setFirstResult(page * 20).setMaxResults(20).getResultList();
        return new TextPage(rows.stream().map(a -> new TextAnswer(a.getSubmission().getId(), a.getTextValue(), a.getSubmission().getSubmittedAt())).toList(),
            total, (int) ((total + 19) / 20), page);
    }

    private FeedbackAnswer validateAnswer(FeedbackQuestion q, Answer input) {
        String value = input == null || input.text() == null ? null : input.text().trim();
        if (value != null && value.isEmpty()) value = null;
        BigDecimal number = input == null ? null : input.number();
        List<Long> ids = input == null ? List.of() : input.optionIds();
        boolean empty = value == null && number == null && ids.isEmpty();
        if (empty) { if (q.isRequired()) bad("Bắt buộc trả lời: " + q.getTitle()); return null; }
        var a = new FeedbackAnswer(); a.setQuestion(q);
        if (text(q.getType())) {
            if (value == null || number != null || !ids.isEmpty()) bad("Câu trả lời phải là văn bản: " + q.getTitle());
            int max = q.getMaxLength() == null ? (q.getType() == Type.SHORT_TEXT ? 255 : 10000) : q.getMaxLength();
            if (value.length() > max) bad("Văn bản vượt quá " + max + " ký tự: " + q.getTitle()); a.setTextValue(value);
        } else if (numeric(q.getType())) {
            if (number == null || value != null || !ids.isEmpty()) bad("Câu trả lời phải là số: " + q.getTitle());
            decimal(number);
            BigDecimal min = q.getType() == Type.LIKERT ? BigDecimal.ONE : q.getMinValue();
            BigDecimal max = q.getType() == Type.LIKERT ? BigDecimal.valueOf(5) : q.getMaxValue();
            if ((min != null && number.compareTo(min) < 0) || (max != null && number.compareTo(max) > 0)) bad("Số ngoài phạm vi: " + q.getTitle());
            if (q.getType() != Type.NUMBER && number.stripTrailingZeros().scale() > 0) bad("Thang điểm chỉ nhận số nguyên: " + q.getTitle());
            a.setNumberValue(number);
        } else {
            if (value != null || number != null || ids.isEmpty() || new HashSet<>(ids).size() != ids.size()) bad("Phương án không hợp lệ: " + q.getTitle());
            if (q.getType() != Type.MULTIPLE_CHOICE && ids.size() != 1) bad("Chỉ chọn một phương án: " + q.getTitle());
            if (q.getType() == Type.MULTIPLE_CHOICE && ((q.getMinSelections() != null && ids.size() < q.getMinSelections())
                || (q.getMaxSelections() != null && ids.size() > q.getMaxSelections()))) bad("Số phương án đã chọn ngoài phạm vi: " + q.getTitle());
            for (Long id : ids) a.getOptions().add(q.getOptions().stream().filter(o -> o.getId().equals(id)).findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phương án không thuộc câu hỏi: " + q.getTitle())));
        }
        return a;
    }

    private void validateForm(Save body) {
        if (body.startsAt() != null && body.endsAt() != null && !body.startsAt().isBefore(body.endsAt())) bad("Ngày kết thúc phải sau ngày bắt đầu.");
        for (var q : body.questions()) {
            if (q.minValue() != null) decimal(q.minValue()); if (q.maxValue() != null) decimal(q.maxValue());
            if (q.minValue() != null && q.maxValue() != null && q.minValue().compareTo(q.maxValue()) > 0) bad("Giá trị nhỏ nhất phải ≤ lớn nhất.");
            if (text(q.type())) {
                int limit = q.type() == Type.SHORT_TEXT ? 255 : 10000;
                if (q.maxLength() != null && (q.maxLength() < 1 || q.maxLength() > limit)) bad("Giới hạn văn bản phải từ 1 đến " + limit + ".");
            } else if (q.maxLength() != null) bad("Giới hạn ký tự chỉ dùng cho câu hỏi văn bản.");
            if (q.type() != Type.NUMBER && q.type() != Type.RATING && (q.minValue() != null || q.maxValue() != null)) bad("Giới hạn số chỉ dùng cho câu hỏi số hoặc thang điểm.");
            if (q.type() == Type.RATING) {
                if (q.minValue() == null || q.maxValue() == null || q.minValue().stripTrailingZeros().scale() > 0 || q.maxValue().stripTrailingZeros().scale() > 0
                    || q.minValue().compareTo(BigDecimal.ZERO) < 0 || q.maxValue().compareTo(BigDecimal.valueOf(20)) > 0 || q.minValue().compareTo(q.maxValue()) >= 0)
                    bad("Thang điểm cần hai cận nguyên khác nhau trong khoảng 0–20.");
            }
            if (choice(q.type()) && q.options().size() < 2) bad("Câu hỏi lựa chọn cần ít nhất hai phương án.");
            if (q.type() == Type.YES_NO && q.options().size() != 2) bad("Có/Không cần đúng hai phương án.");
            if (q.type() == Type.LIKERT && q.options().size() != 5) bad("Likert cần nhãn cho đủ năm mức 1–5.");
            if (!choice(q.type()) && q.type() != Type.LIKERT && !q.options().isEmpty()) bad("Loại câu hỏi này không có phương án.");
            if (q.options().stream().map(o -> o.label().trim().toLowerCase(Locale.ROOT)).distinct().count() != q.options().size()) bad("Nhãn phương án không được trùng.");
            if (q.type() == Type.MULTIPLE_CHOICE) {
                int min = q.minSelections() == null ? 1 : q.minSelections(); int max = q.maxSelections() == null ? q.options().size() : q.maxSelections();
                if (min < 1 || max < min || max > q.options().size()) bad("Giới hạn số lựa chọn không hợp lệ.");
            } else if (q.minSelections() != null || q.maxSelections() != null) bad("Giới hạn số lựa chọn chỉ dùng cho chọn nhiều.");
        }
    }
    private void decimal(BigDecimal n) {
        if (n.abs().compareTo(new BigDecimal("100000000000000")) >= 0 || n.stripTrailingZeros().scale() > 4) bad("Số tối đa 14 chữ số phần nguyên và 4 chữ số thập phân.");
    }
    private void applyMetadata(FeedbackForm f, Save b) {
        f.setTitle(b.title().trim()); f.setDescription(b.description().trim()); f.setOnePerUser(b.onePerUser()); f.setStartsAt(b.startsAt()); f.setEndsAt(b.endsAt());
    }
    private void replaceQuestions(FeedbackForm f, List<Question> items) {
        for (int i = 0; i < items.size(); i++) {
            var input = items.get(i); var q = new FeedbackQuestion(); q.setForm(f); q.setPosition(i); q.setTitle(input.title().trim());
            q.setDescription(input.description().trim()); q.setType(input.type()); q.setRequired(input.required());
            q.setMinValue(input.minValue()); q.setMaxValue(input.maxValue()); q.setMaxLength(input.maxLength());
            q.setMinSelections(input.minSelections()); q.setMaxSelections(input.maxSelections());
            for (int j = 0; j < input.options().size(); j++) { var o = new FeedbackOption(); o.setQuestion(q); o.setPosition(j); o.setLabel(input.options().get(j).label().trim()); q.getOptions().add(o); }
            f.getQuestions().add(q);
        }
    }
    private boolean sameSchema(FeedbackForm f, List<Question> questions) {
        // Canonical decimals prevent JDBC scale differences from treating an unchanged schema as edited.
        return f.getQuestions().stream().map(this::question).toList().equals(questions.stream().map(q -> new Question(q.id(), q.title().trim(), q.description().trim(), q.type(), q.required(),
            canonical(q.minValue()), canonical(q.maxValue()), q.maxLength(), q.minSelections(), q.maxSelections(),
            q.options().stream().map(o -> new Option(o.id(), o.label().trim())).toList())).toList());
    }
    private BigDecimal canonical(BigDecimal n) { return n == null ? null : n.stripTrailingZeros(); }
    private Question question(FeedbackQuestion q) {
        return new Question(q.getId(), q.getTitle(), q.getDescription(), q.getType(), q.isRequired(), canonical(q.getMinValue()), canonical(q.getMaxValue()),
            q.getMaxLength(), q.getMinSelections(), q.getMaxSelections(), q.getOptions().stream().map(o -> new Option(o.getId(), o.getLabel())).toList());
    }
    private Form view(FeedbackForm f, Long userId) {
        return new Form(f.getId(), f.getRevision(), f.getTitle(), f.getDescription(), f.getStatus(), isOpen(f), f.isOnePerUser(), f.getStartsAt(), f.getEndsAt(),
            f.getPublishedAt(), f.getClosedAt(), userId != null && hasSubmitted(f.getId(), userId), submissionCount(f.getId()) > 0,
            f.getQuestions().stream().map(this::question).toList());
    }
    private boolean isOpen(FeedbackForm f) {
        Instant now = Instant.now();
        return "PUBLISHED".equals(f.getStatus()) && Integer.valueOf(1).equals(f.getActiveSlot())
            && (f.getStartsAt() == null || !now.isBefore(f.getStartsAt())) && (f.getEndsAt() == null || now.isBefore(f.getEndsAt()));
    }
    private void requireOpen(FeedbackForm f) { if (!isOpen(f)) conflict("Đợt khảo sát chưa mở, đã tạm dừng hoặc đã kết thúc."); }
    private void revision(FeedbackForm f, Long revision) { if (revision == null || revision != f.getRevision()) conflict("Biểu mẫu đã thay đổi. Vui lòng tải lại trang."); }
    private FeedbackForm find(Long id) { return forms.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đợt feedback.")); }
    private FeedbackForm lock(Long id) { return forms.lockById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đợt feedback.")); }
    private long count(String query, Long id) { return em.createQuery(query, Long.class).setParameter("id", id).getSingleResult(); }
    private long submissionCount(Long id) { return count("select count(s) from FeedbackSubmission s where s.form.id = :id", id); }
    private boolean hasSubmitted(Long formId, Long userId) {
        return em.createQuery("select count(s) from FeedbackSubmission s where s.form.id = :form and s.userId = :user", Long.class)
            .setParameter("form", formId).setParameter("user", userId).getSingleResult() > 0;
    }
    private void visit(Long formId, Long userId) {
        if (em.createQuery("select count(v) from FeedbackVisit v where v.formId = :form and v.userId = :user", Long.class)
            .setParameter("form", formId).setParameter("user", userId).getSingleResult() == 0) {
            var v = new FeedbackVisit(); v.setFormId(formId); v.setUserId(userId); em.persist(v);
        }
    }
    private boolean choice(Type t) { return Set.of(Type.SINGLE_CHOICE, Type.MULTIPLE_CHOICE, Type.DROPDOWN, Type.YES_NO).contains(t); }
    private boolean numeric(Type t) { return Set.of(Type.NUMBER, Type.LIKERT, Type.RATING).contains(t); }
    private boolean text(Type t) { return t == Type.SHORT_TEXT || t == Type.LONG_TEXT; }
    private double percent(long n, long total) { return total == 0 ? 0 : 100.0 * n / total; }
    private void checkPage(int page) { if (page < 0 || page > 1000000) bad("Trang không hợp lệ."); }
    private void bad(String message) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message); }
    private void conflict(String message) { throw new ResponseStatusException(HttpStatus.CONFLICT, message); }
}
