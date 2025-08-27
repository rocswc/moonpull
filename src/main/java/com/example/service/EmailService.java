package com.example.service;

public interface EmailService {
    void sendResetPasswordEmail(String to, String token);
}
