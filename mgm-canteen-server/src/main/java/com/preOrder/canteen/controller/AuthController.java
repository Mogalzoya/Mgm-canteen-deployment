package com.preOrder.canteen.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.preOrder.canteen.dto.EmailRequestDto;
import com.preOrder.canteen.dto.LoginRequestDto;
import com.preOrder.canteen.dto.LoginResponseDto;
import com.preOrder.canteen.dto.RegisterRequestDto;
import com.preOrder.canteen.dto.ResetPasswordRequestDto;
import com.preOrder.canteen.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // Login with email + password
    @PostMapping("/login")
    public LoginResponseDto login(@RequestBody LoginRequestDto request) {
        return authService.login(request);
    }

    // Registration step 1: send a verification code to the email
    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, String>> sendOtp(@Valid @RequestBody EmailRequestDto request) {
        authService.sendRegistrationOtp(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "Verification code sent to your email"));
    }

    // Registration step 2: name, email, phone, password + the code from the email
    @PostMapping("/register")
    public LoginResponseDto register(@Valid @RequestBody RegisterRequestDto request) {
        return authService.register(request);
    }

    // Forgot password step 1: send a reset code to the email
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody EmailRequestDto request) {
        authService.sendResetOtp(request.getEmail());
        return ResponseEntity.ok(Map.of(
                "message", "If this email is registered, a reset code has been sent."));
    }

    // Forgot password step 2: code + new password
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequestDto request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Password changed. You can log in now."));
    }
}
