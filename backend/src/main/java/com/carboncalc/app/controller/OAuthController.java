package com.carboncalc.app.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class OAuthController {

    @GetMapping("/oauth/success")
    public String oauthSuccess() {
        return "OAuth login successful";
    }
}