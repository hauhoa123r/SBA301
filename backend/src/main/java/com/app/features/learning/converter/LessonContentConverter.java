package com.app.features.learning.converter;

import com.app.features.learning.dto.response.DocumentResponse;
import com.app.features.learning.dto.response.SentencePatternResponse;
import com.app.features.learning.dto.response.VocabularyResponse;
import com.app.features.model.LessonDocumentEntity;
import com.app.features.model.SentencePatternEntity;
import com.app.features.model.VocabularyEntity;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class LessonContentConverter {

    public List<DocumentResponse> toDocumentResponses(List<LessonDocumentEntity> documents) {
        return documents.stream().map(this::toDocumentResponse).toList();
    }

    public List<VocabularyResponse> toVocabularyResponses(List<VocabularyEntity> vocabularies) {
        return vocabularies.stream().map(this::toVocabularyResponse).toList();
    }

    public List<SentencePatternResponse> toSentencePatternResponses(List<SentencePatternEntity> patterns) {
        return patterns.stream().map(this::toSentencePatternResponse).toList();
    }

    private DocumentResponse toDocumentResponse(LessonDocumentEntity document) {
        return DocumentResponse.builder().id(document.getId()).title(document.getTitle()).fileUrl(document.getFileUrl()).build();
    }

    private VocabularyResponse toVocabularyResponse(VocabularyEntity vocabulary) {
        VocabularyResponse.VocabularyResponseBuilder builder = VocabularyResponse.builder();

        builder.id(vocabulary.getId());
        builder.hanzi(vocabulary.getHanzi());
        builder.pinyin(vocabulary.getPinyin());
        builder.vietnameseMeaning(vocabulary.getVietnameseMeaning());
        builder.imageUrl(vocabulary.getImageUrl());
        builder.audioUrl(vocabulary.getAudioUrl());
        builder.orderIndex(vocabulary.getOrderIndex());

        return builder.build();
    }

    private SentencePatternResponse toSentencePatternResponse(SentencePatternEntity pattern) {
        SentencePatternResponse.SentencePatternResponseBuilder builder = SentencePatternResponse.builder();

        builder.id(pattern.getId());
        builder.vocabularyId(pattern.getVocabulary() != null ? pattern.getVocabulary().getId() : null);
        builder.chineseText(pattern.getChineseText());
        builder.pinyinText(pattern.getPinyinText());
        builder.vietnameseMeaning(pattern.getVietnameseMeaning());
        builder.audioUrl(pattern.getAudioUrl());
        builder.orderIndex(pattern.getOrderIndex());

        return builder.build();
    }
}
