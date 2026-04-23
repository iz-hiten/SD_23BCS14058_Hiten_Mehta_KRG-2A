package com.calendar;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CalendarBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(CalendarBackendApplication.class, args);
        System.out.println("Server running on http://localhost:8080");
    }
}
