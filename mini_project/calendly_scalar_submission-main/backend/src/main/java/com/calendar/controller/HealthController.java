package com.calendar.controller;

import com.calendar.ratelimit.RateLimiterInterceptor;
import com.calendar.ratelimit.TokenBucket;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @Value("${spring.application.name}")
    private String applicationName;

    @Value("${app.url}")
    private String appUrl;

    @Autowired
    private RateLimiterInterceptor rateLimiterInterceptor;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ok");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("application", applicationName);
        response.put("appUrl", appUrl);
        response.put("rateLimiter", "enabled");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/rate-limit-stats")
    public ResponseEntity<Map<String, Object>> rateLimitStats() {
        Map<String, TokenBucket> buckets = rateLimiterInterceptor.getBuckets();
        
        List<Map<String, Object>> bucketList = new ArrayList<>();
        for (Map.Entry<String, TokenBucket> entry : buckets.entrySet()) {
            Map<String, Object> bucketInfo = new HashMap<>();
            bucketInfo.put("clientId", entry.getKey());
            bucketInfo.put("tokens", entry.getValue().getRemainingTokens());
            bucketList.add(bucketInfo);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("totalClients", buckets.size());
        response.put("buckets", bucketList);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> test() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Test endpoint");
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }
}
