package com.preOrder.canteen.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Service;

/**
 * Keeps one-time email codes in memory. A code expires after 5 minutes, can be requested
 * again only after 60 seconds, and is thrown away after 5 wrong guesses.
 * (In memory means codes are lost if the server restarts. That is fine for a canteen app;
 * for several servers you would move this to Redis.)
 */
@Service
public class OtpService {

    public enum Purpose { REGISTER, RESET }

    private static final Duration TTL = Duration.ofMinutes(5);
    private static final Duration RESEND_COOLDOWN = Duration.ofSeconds(60);
    private static final int MAX_ATTEMPTS = 5;

    private final SecureRandom random = new SecureRandom();
    private final Map<String, OtpData> store = new HashMap<>();

    public synchronized boolean canSend(Purpose purpose, String email) {
        OtpData existing = store.get(key(purpose, email));
        return existing == null
                || Instant.now().isAfter(existing.sentAt.plus(RESEND_COOLDOWN));
    }

    /** Creates a new 6-digit code. Call canSend() first. */
    public synchronized String generate(Purpose purpose, String email) {
        removeExpired();
        String code = String.format("%06d", random.nextInt(1_000_000));
        Instant now = Instant.now();
        store.put(key(purpose, email), new OtpData(code, now, now.plus(TTL)));
        return code;
    }

    /** True only for a correct, unexpired code. A correct code can be used once. */
    public synchronized boolean verify(Purpose purpose, String email, String entered) {
        if (email == null || entered == null) {
            return false;
        }
        String k = key(purpose, email);
        OtpData data = store.get(k);
        if (data == null) {
            return false;
        }
        if (Instant.now().isAfter(data.expiresAt)) {
            store.remove(k);
            return false;
        }

        boolean match = MessageDigest.isEqual(
                data.code.getBytes(StandardCharsets.UTF_8),
                entered.trim().getBytes(StandardCharsets.UTF_8));

        if (match) {
            store.remove(k);
            return true;
        }

        data.attempts++;
        if (data.attempts >= MAX_ATTEMPTS) {
            store.remove(k);
        }
        return false;
    }

    private void removeExpired() {
        Instant now = Instant.now();
        store.values().removeIf(d -> now.isAfter(d.expiresAt));
    }

    private String key(Purpose purpose, String email) {
        return purpose + ":" + email.trim().toLowerCase(Locale.ROOT);
    }

    private static class OtpData {
        private final String code;
        private final Instant sentAt;
        private final Instant expiresAt;
        private int attempts = 0;

        private OtpData(String code, Instant sentAt, Instant expiresAt) {
            this.code = code;
            this.sentAt = sentAt;
            this.expiresAt = expiresAt;
        }
    }
}
