package com.preOrder.canteen.service;

import java.util.Locale;
import java.util.Optional;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.preOrder.canteen.dto.LoginRequestDto;
import com.preOrder.canteen.dto.LoginResponseDto;
import com.preOrder.canteen.dto.RegisterRequestDto;
import com.preOrder.canteen.dto.ResetPasswordRequestDto;
import com.preOrder.canteen.entity.Role;
import com.preOrder.canteen.entity.User;
import com.preOrder.canteen.exception.BadRequestException;
import com.preOrder.canteen.repository.UserRepository;
import com.preOrder.canteen.security.JwtUtil;
import com.preOrder.canteen.service.OtpService.Purpose;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final OtpService otpService;
    private final EmailService emailService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(
            UserRepository userRepository,
            JwtUtil jwtUtil,
            OtpService otpService,
            EmailService emailService) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.otpService = otpService;
        this.emailService = emailService;
    }

    private String normalize(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private LoginResponseDto toLoginResponse(User user) {
        String role = user.getRole().name();
        String token = jwtUtil.generateToken(user.getEmail(), role);
        return new LoginResponseDto(token, user.getName(), user.getEmail(), role, user.getId());
    }

    // ---------- Login: email + password ----------
    public LoginResponseDto login(LoginRequestDto request) {

        User user = userRepository.findByEmailIgnoreCase(normalize(request.getEmail()))
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (request.getPassword() == null
                || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }
        return toLoginResponse(user);
    }

    // ---------- Registration step 1: email a verification code ----------
    public void sendRegistrationOtp(String rawEmail) {
        String email = normalize(rawEmail);

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("Email already registered. Please log in.");
        }
        if (!otpService.canSend(Purpose.REGISTER, email)) {
            throw new BadRequestException("Please wait a minute before asking for another code.");
        }
        String code = otpService.generate(Purpose.REGISTER, email);
        emailService.sendOtpEmail(email, code, Purpose.REGISTER);
    }

    // ---------- Registration step 2: check the code, then create the account ----------
    public LoginResponseDto register(RegisterRequestDto request) {
        String email = normalize(request.getEmail());

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("Email already registered. Please log in.");
        }
        if (!otpService.verify(Purpose.REGISTER, email, request.getOtp())) {
            throw new BadRequestException("Invalid or expired verification code");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.STUDENT);

        return toLoginResponse(userRepository.save(user));
    }

    // ---------- Forgot password step 1: email a reset code ----------
    // Always behaves the same, so nobody can use this to find out who is registered.
    public void sendResetOtp(String rawEmail) {
        String email = normalize(rawEmail);

        Optional<User> user = userRepository.findByEmailIgnoreCase(email);
        if (user.isPresent() && otpService.canSend(Purpose.RESET, email)) {
            String code = otpService.generate(Purpose.RESET, email);
            emailService.sendOtpEmail(user.get().getEmail(), code, Purpose.RESET);
        }
    }

    // ---------- Forgot password step 2: code + new password ----------
    public void resetPassword(ResetPasswordRequestDto request) {
        String email = normalize(request.getEmail());

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BadRequestException("Invalid or expired verification code"));

        if (!otpService.verify(Purpose.RESET, email, request.getOtp())) {
            throw new BadRequestException("Invalid or expired verification code");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
