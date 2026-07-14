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
public class VocabularyResponse {
    private Long id;
    private String hanzi;
    private String pinyin;
    private String vietnameseMeaning;
    private String imageUrl;
    private String audioUrl;
    private Integer orderIndex;
}
