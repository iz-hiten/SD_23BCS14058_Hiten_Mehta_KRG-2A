package com.calendar.ratelimit;

public class TokenBucket {
    private double tokens;
    private long lastRefill;
    private final int maxTokens;
    private final double refillRate;

    public TokenBucket(int maxTokens, double refillRate) {
        this.maxTokens = maxTokens;
        this.refillRate = refillRate;
        this.tokens = maxTokens;
        this.lastRefill = System.currentTimeMillis();
    }

    public synchronized boolean tryConsume() {
        refill();
        if (tokens >= 1) {
            tokens -= 1;
            return true;
        }
        return false;
    }

    public synchronized void refill() {
        long now = System.currentTimeMillis();
        double timePassed = (now - lastRefill) / 1000.0; // seconds
        double tokensToAdd = timePassed * refillRate;
        tokens = Math.min(maxTokens, tokens + tokensToAdd);
        lastRefill = now;
    }

    public synchronized int getRemainingTokens() {
        refill();
        return (int) Math.floor(tokens);
    }

    public int getMaxTokens() {
        return maxTokens;
    }

    public long getLastRefill() {
        return lastRefill;
    }
}
