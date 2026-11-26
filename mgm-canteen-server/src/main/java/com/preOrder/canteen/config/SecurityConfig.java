
package com.preOrder.canteen.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;

import com.preOrder.canteen.security.JwtAuthenticationFilter;
import com.preOrder.canteen.security.JwtUtil;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtUtil jwtUtil) throws Exception {

        JwtAuthenticationFilter jwtFilter =
                new JwtAuthenticationFilter(jwtUtil);

        http
            .csrf(csrf -> csrf.disable())

            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())

            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(
                    new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))

            .authorizeHttpRequests(auth -> auth
                    // Frontend files that Spring serves itself
                    .requestMatchers(
                        "/", "/index.html",
                        "/style.css", "/app.js",
                        "/favicon.ico",
                        "/error"
                    ).permitAll()

                    // Food photos are public so the menu can show them
                    .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()

                    // Login, email verification and password reset need no token
                    .requestMatchers(
                        HttpMethod.POST,
                        "/api/auth/login",
                        "/api/auth/send-otp",
                        "/api/auth/register",
                        "/api/auth/forgot-password",
                        "/api/auth/reset-password"
                    ).permitAll()

                    // Only an admin can add or change food and upload photos
                    .requestMatchers(HttpMethod.POST, "/api/food", "/api/food/**").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.PUT, "/api/food/**").hasRole("ADMIN")

                    // User management is admin only (students register through /api/auth/register)
                    .requestMatchers("/api/user", "/api/user/**").hasRole("ADMIN")

                    // Everything else needs a logged-in user
                    .anyRequest().authenticated()
                )

            .addFilterBefore(
                jwtFilter,
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
