
package com.preOrder.canteen.security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }
    
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();

        return path.startsWith("/api/auth/");
    }
    
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {

            String token = header.substring(7);

            try {
                Claims claims = jwtUtil.getClaims(token);
                String email = claims.getSubject();
                String role = claims.get("role", String.class);

                if (email != null
                        && role != null
                        && SecurityContextHolder.getContext()
                                .getAuthentication() == null) {

                    var authorities = List.of(
                            new SimpleGrantedAuthority("ROLE_" + role));

                    var authentication =
                            new UsernamePasswordAuthenticationToken(
                                    email, null, authorities);

                    SecurityContext context =
                            SecurityContextHolder.createEmptyContext();

                    context.setAuthentication(authentication);
                    SecurityContextHolder.setContext(context);
                }

            } catch (JwtException | IllegalArgumentException ex) {
                // Invalid or expired token: leave the request unauthenticated.
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}
