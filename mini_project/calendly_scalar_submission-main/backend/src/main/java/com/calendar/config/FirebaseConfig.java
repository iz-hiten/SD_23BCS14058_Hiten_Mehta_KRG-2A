package com.calendar.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import javax.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initialize() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                // Try to load from classpath first
                InputStream serviceAccount = null;
                try {
                    serviceAccount = new ClassPathResource("firebase-service-account.json").getInputStream();
                } catch (Exception e) {
                    // If not in classpath, try from project root
                    try {
                        serviceAccount = new FileInputStream("firebase-service-account.json");
                    } catch (Exception ex) {
                        // Use default credentials if no service account file found
                        System.out.println("No Firebase service account file found, using default credentials");
                    }
                }

                FirebaseOptions.Builder optionsBuilder = FirebaseOptions.builder();
                
                if (serviceAccount != null) {
                    optionsBuilder.setCredentials(GoogleCredentials.fromStream(serviceAccount));
                } else {
                    optionsBuilder.setCredentials(GoogleCredentials.getApplicationDefault());
                }

                FirebaseApp.initializeApp(optionsBuilder.build());
                System.out.println("Firebase initialized successfully");
            }
        } catch (IOException e) {
            System.err.println("Failed to initialize Firebase: " + e.getMessage());
            // Don't throw exception, allow app to start without Firebase
        }
    }
}
