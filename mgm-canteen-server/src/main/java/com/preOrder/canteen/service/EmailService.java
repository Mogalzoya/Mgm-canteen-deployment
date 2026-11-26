package com.preOrder.canteen.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.preOrder.canteen.exception.BadRequestException;
import com.preOrder.canteen.service.OtpService.Purpose;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromAddress;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String to, String otp, Purpose purpose) {

        String subject;
        String intro;
        if (purpose == Purpose.REGISTER) {
            subject = "Verify your email - MGM's Canteen";
            intro = "Use this code to verify your email and finish creating your Canteen account:";
        } else {
            subject = "Reset your password - MGM's Canteen";
            intro = "Use this code to reset your Canteen password:";
        }

        // Development mode: no Gmail configured, so print the code in the console.
        if (fromAddress == null || fromAddress.isBlank()) {
            log.warn("[DEV MODE - no email sent] {} code for {} is: {}", purpose, to, otp);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(
                "Hello,\n\n"
                + intro + "\n\n"
                + "        " + otp + "\n\n"
                + "This code is valid for 5 minutes.\n"
                + "If you did not ask for this, you can ignore this email.\n"
                + "Please do not share this code with anyone.\n\n"
                + "MGM's Canteen");

        try {
            mailSender.send(message);
        } catch (MailException e) {
            log.error("Could not send email to {}: {}", to, e.getMessage());
            throw new BadRequestException(
                    "We could not send the email right now. Check the address and try again.");
        }
    }
}
