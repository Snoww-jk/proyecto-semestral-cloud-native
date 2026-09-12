package com.urbankicks.bff.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtDecoders;
import org.springframework.security.oauth2.jwt.JwtValidationException;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain security(
            HttpSecurity http,
            JwtRoles jwtRoles
    ) throws Exception {

        JwtAuthenticationConverter converter =
                new JwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(jwtRoles);

        return http
                .csrf(csrf -> csrf.disable())
                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource()
                        )
                )
                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        )
                        .permitAll()

                        .requestMatchers(
                                "/actuator/health",
                                "/api/public/**"
                        )
                        .permitAll()

                        .requestMatchers(
                                "/api/admin/**"
                        )
                        .hasAnyAuthority(
                                "ROLE_admin",
                                "ROLE_operator"
                        )

                        .requestMatchers(
                                "/api/**"
                        )
                        .authenticated()

                        .anyRequest()
                        .permitAll()
                )
                .oauth2ResourceServer(oauth ->
                        oauth.jwt(jwt ->
                                jwt.jwtAuthenticationConverter(
                                        converter
                                )
                        )
                )
                .build();
    }

    @Bean
    JwtDecoder jwtDecoder(
            @Value(
                    "${spring.security.oauth2.resourceserver.jwt.issuer-uri}"
            )
            String issuer,

            @Value(
                    "${urban-kicks.security.client-id}"
            )
            String clientId
    ) {

        JwtDecoder cognitoDecoder =
                JwtDecoders.fromIssuerLocation(issuer);

        OAuth2TokenValidator<Jwt> defaultValidator =
                JwtValidators.createDefaultWithIssuer(issuer);

        OAuth2TokenValidator<Jwt> clientValidator =
                new CognitoTokenValidator(clientId);

        OAuth2TokenValidator<Jwt> validator =
                new DelegatingOAuth2TokenValidator<>(
                        defaultValidator,
                        clientValidator
                );

        return token -> {
            Jwt jwt = cognitoDecoder.decode(token);

            var result = validator.validate(jwt);

            if (result.hasErrors()) {
                throw new JwtValidationException(
                        "JWT invalido",
                        result.getErrors()
                );
            }

            return jwt;
        };
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:5173"
                )
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PATCH",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type"
                )
        );

        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}
