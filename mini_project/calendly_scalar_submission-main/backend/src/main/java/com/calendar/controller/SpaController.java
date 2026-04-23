package com.calendar.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    /**
     * Forward all non-API routes to index.html for SPA routing
     * This ensures that React Router can handle client-side routing
     */
    @GetMapping(value = {
            "/",
            "/login",
            "/dashboard",
            "/availability",
            "/meetings",
            "/profile",
            "/booking/**"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
