package com.carboncalc.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple in-memory sliding-window rate limiter.
 * Tracks attempts per key (IP address) for login and OTP endpoints.
 */
@Component
public class RateLimiter {

    @Value("${rate.limit.login.max-attempts:10}")
    private int loginMaxAttempts;

    @Value("${rate.limit.login.window-seconds:60}")
    private long loginWindowSeconds;

    @Value("${rate.limit.otp.max-attempts:3}")
    private int otpMaxAttempts;

    @Value("${rate.limit.otp.window-seconds:300}")
    private long otpWindowSeconds;

    // key → list of attempt timestamps (epoch seconds)
    private final Map<String, java.util.Deque<Long>> loginAttempts = new ConcurrentHashMap<>();
    private final Map<String, java.util.Deque<Long>> otpAttempts   = new ConcurrentHashMap<>();

    /** Returns true if the request is allowed, false if rate limit exceeded. */
    public boolean allowLogin(String ip) {
        return allow(loginAttempts, ip, loginMaxAttempts, loginWindowSeconds);
    }

    /** Returns true if the request is allowed, false if rate limit exceeded. */
    public boolean allowOtp(String ip) {
        return allow(otpAttempts, ip, otpMaxAttempts, otpWindowSeconds);
    }

    private boolean allow(Map<String, java.util.Deque<Long>> store, String key, int max, long windowSecs) {
        long now = Instant.now().getEpochSecond();
        store.putIfAbsent(key, new java.util.ArrayDeque<>());
        java.util.Deque<Long> timestamps = store.get(key);

        synchronized (timestamps) {
            // Remove timestamps outside the window
            while (!timestamps.isEmpty() && timestamps.peekFirst() < now - windowSecs) {
                timestamps.pollFirst();
            }
            if (timestamps.size() >= max) {
                return false; // rate limit exceeded
            }
            timestamps.addLast(now);
            return true;
        }
    }

    /** Seconds remaining until the window resets for login. */
    public long loginRetryAfter(String ip) {
        return retryAfter(loginAttempts, ip, loginWindowSeconds);
    }

    /** Seconds remaining until the window resets for OTP. */
    public long otpRetryAfter(String ip) {
        return retryAfter(otpAttempts, ip, otpWindowSeconds);
    }

    private long retryAfter(Map<String, java.util.Deque<Long>> store, String key, long windowSecs) {
        java.util.Deque<Long> timestamps = store.get(key);
        if (timestamps == null || timestamps.isEmpty()) return 0;
        long oldest = timestamps.peekFirst();
        long resetAt = oldest + windowSecs;
        long now = Instant.now().getEpochSecond();
        return Math.max(0, resetAt - now);
    }
}
