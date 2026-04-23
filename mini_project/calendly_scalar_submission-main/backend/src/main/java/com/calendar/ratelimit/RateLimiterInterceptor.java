package com.calendar.ratelimit;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimiterInterceptor implements HandlerInterceptor {

    private final Map<String, TokenBucket> buckets = new ConcurrentHashMap<>();
    private final int maxTokens = 10;
    private final double refillRate = 1.0; // tokens per second
    private final long windowMs = 60000; // 60 seconds

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws IOException {
        String clientId = getClientId(request);
        
        TokenBucket bucket = buckets.computeIfAbsent(clientId, k -> new TokenBucket(maxTokens, refillRate));

        if (bucket.tryConsume()) {
            // Add rate limit headers
            response.setHeader("X-RateLimit-Limit", String.valueOf(maxTokens));
            response.setHeader("X-RateLimit-Remaining", String.valueOf(bucket.getRemainingTokens()));
            response.setHeader("X-RateLimit-Reset", String.valueOf(bucket.getLastRefill() + windowMs));
            return true;
        } else {
            // Rate limit exceeded
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write(String.format(
                "{\"error\":\"Too Many Requests\",\"message\":\"Rate limit exceeded. Please try again later.\",\"retryAfter\":%d,\"limit\":%d,\"remaining\":0}",
                (int) Math.ceil((1 - bucket.getRemainingTokens()) / refillRate),
                maxTokens
            ));
            return false;
        }
    }

    private String getClientId(HttpServletRequest request) {
        String clientIp = request.getHeader("X-Forwarded-For");
        if (clientIp == null || clientIp.isEmpty()) {
            clientIp = request.getRemoteAddr();
        }
        return clientIp;
    }

    public Map<String, TokenBucket> getBuckets() {
        return buckets;
    }
}
