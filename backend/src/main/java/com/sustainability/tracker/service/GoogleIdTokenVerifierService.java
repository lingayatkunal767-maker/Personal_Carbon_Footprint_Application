package com.sustainability.tracker.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Collections;
import java.util.Objects;
import java.util.Set;

@Service
public class GoogleIdTokenVerifierService {

    private static final Set<String> ALLOWED_ISSUERS = Set.of("accounts.google.com", "https://accounts.google.com");

    private final String configuredClientId;
    private final GoogleIdTokenVerifier verifier;

    public GoogleIdTokenVerifierService(@Value("${auth.google.client-id:}") String configuredClientId) {
        this.configuredClientId = configuredClientId == null ? "" : configuredClientId.trim();
        if (this.configuredClientId.isBlank()) {
            this.verifier = null;
            return;
        }

        this.verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(this.configuredClientId))
                .build();
    }

    public boolean isConfigured() {
        return !configuredClientId.isBlank() && verifier != null;
    }

    public VerifiedGoogleClaims verify(String idToken) {
        if (!isConfigured() || idToken == null || idToken.isBlank()) {
            return null;
        }

        try {
            GoogleIdToken token = verifier.verify(idToken);
            if (token == null) {
                return null;
            }

            GoogleIdToken.Payload payload = token.getPayload();
            if (!ALLOWED_ISSUERS.contains(payload.getIssuer())) {
                return null;
            }

            Long expiresAt = payload.getExpirationTimeSeconds();
            if (expiresAt == null || expiresAt <= Instant.now().getEpochSecond()) {
                return null;
            }

            String email = payload.getEmail();
            String googleId = payload.getSubject();
            if (email == null || email.isBlank() || googleId == null || googleId.isBlank()) {
                return null;
            }

            boolean emailVerified = isEmailVerified(payload.get("email_verified"));
            String name = asString(payload.get("name"));
            String picture = asString(payload.get("picture"));

            return new VerifiedGoogleClaims(googleId, email, name, picture, emailVerified);
        } catch (Exception ignored) {
            return null;
        }
    }

    private boolean isEmailVerified(Object value) {
        if (value instanceof Boolean boolValue) {
            return boolValue;
        }
        if (value instanceof String stringValue) {
            return Boolean.parseBoolean(stringValue);
        }
        return false;
    }

    private String asString(Object value) {
        return value == null ? null : Objects.toString(value, null);
    }

    public record VerifiedGoogleClaims(
            String googleId,
            String email,
            String name,
            String profilePicture,
            boolean emailVerified
    ) {
    }
}
