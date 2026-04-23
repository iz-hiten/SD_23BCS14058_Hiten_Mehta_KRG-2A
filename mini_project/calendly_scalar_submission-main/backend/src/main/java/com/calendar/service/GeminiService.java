package com.calendar.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Service for interacting with Google Gemini AI API
 * This is a placeholder for future AI integration
 */
@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    /**
     * Check if Gemini API is configured
     */
    public boolean isConfigured() {
        return apiKey != null && !apiKey.isEmpty() && !apiKey.equals("MY_GEMINI_API_KEY");
    }

    /**
     * Placeholder for Gemini AI integration
     * Add your AI logic here when needed
     */
    public String generateResponse(String prompt) {
        if (!isConfigured()) {
            throw new IllegalStateException("Gemini API key is not configured");
        }
        
        // TODO: Implement actual Gemini API call
        return "Gemini API integration placeholder";
    }
}
