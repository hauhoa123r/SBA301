package com.app.features.learning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SentencePatternResponse {
    private Long id;
    private Long vocabularyId;
    private String chineseText;
    private String pinyinText;
    private String vietnameseMeaning;
    private String audioUrl;
    private Integer orderIndex;
}
