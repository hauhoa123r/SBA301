package com.app.features.oauth.dto.request;

import jakarta.validation.constraints.NotBlank;

public record OAuthTokenExchangeRequest(@NotBlank String code) {

}
