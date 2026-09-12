package com.urbankicks.bff.config;

import java.util.List;

import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;

public class CognitoTokenValidator implements OAuth2TokenValidator<Jwt> {

    private final String clientId;

    public CognitoTokenValidator(String clientId) {
        this.clientId = clientId;
    }

    @Override
    public OAuth2TokenValidatorResult validate(Jwt jwt) {

        List<String> audience = jwt.getAudience();
        String tokenClientId = jwt.getClaimAsString("client_id");

        boolean audienceValida =
                audience != null && audience.contains(clientId);

        boolean clientIdValido =
                clientId.equals(tokenClientId);

        if (audienceValida || clientIdValido) {
            return OAuth2TokenValidatorResult.success();
        }

        OAuth2Error error = new OAuth2Error(
                "invalid_token",
                "El token no pertenece al cliente Cognito esperado",
                null
        );

        return OAuth2TokenValidatorResult.failure(error);
    }
}