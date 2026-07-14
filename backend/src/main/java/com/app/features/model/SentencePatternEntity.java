package com.app.features.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "sentence_patterns")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SentencePatternEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private LessonEntity lesson;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vocabulary_id")
    private VocabularyEntity vocabulary;

    @NotNull
    @Column(name = "chinese_text", nullable = false, length = 500)
    private String chineseText;

    @NotNull
    @Column(name = "pinyin_text", nullable = false, length = 500)
    private String pinyinText;

    @NotNull
    @Column(name = "vietnamese_meaning", nullable = false, length = 500)
    private String vietnameseMeaning;

    @Size(max = 500)
    @Column(name = "audio_url", length = 500)
    private String audioUrl;

    @NotNull
    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;
}
