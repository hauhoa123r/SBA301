package com.app.features.learning.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.Map;

public record SubmitQuizRequest(@NotNull @Size(max = 200) List<@NotNull @Valid Response> answers) {
    public record Response(@NotNull Long questionId, @Size(max = 100) List<Long> answerIds,
                           @Size(max = 4000) String text, @Size(max = 100) Map<String, String> matches) { }
}
