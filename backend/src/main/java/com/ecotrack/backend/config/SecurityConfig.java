package com.ecotrack.backend.config;

import com.ecotrack.backend.security.JwtFilter;
import com.ecotrack.backend.security.JwtUtil;
import com.ecotrack.backend.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsUtils;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtUtil     jwtUtil;
    private final JwtFilter   jwtFilter;
    private final AuthService authService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .exceptionHandling(ex -> ex.authenticationEntryPoint((req, res, e) ->
                res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized")
            ))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(CorsUtils::isPreFlightRequest).permitAll()
                .requestMatchers(
                    // Auth flows — no token needed
                    "/api/auth/**",
                    "/api/otp/**",
                    "/oauth2/**",
                    "/login/oauth2/**",
                    "/error",
                    // Browsing items is public (no login needed to see the store)
                    "/api/marketplace/items"
                    // NOTE: /api/marketplace/purchase and /api/marketplace/history
                    // are intentionally NOT here — they require a logged-in user
                ).permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(sess ->
                sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .oauth2Login(oauth -> oauth.successHandler((req, res, authentication) -> {
                OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
                String email = oAuth2User.getAttribute("email");
                String name  = oAuth2User.getAttribute("name");
                var    user  = authService.saveOAuthUser(email, name);
                String token = jwtUtil.generateToken(user.getEmail());
                res.sendRedirect(
                    "http://localhost:5173/oauth-success"
                        + "?token="             + token
                        + "&needsVerification=" + !user.isEnabled()
                        + "&email="             + user.getEmail()
                );
            }));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        // FIX: original only had 5174 — Vite default is 5173
        cfg.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:5174"));
        cfg.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        cfg.setAllowedHeaders(List.of("Authorization","Content-Type","Cache-Control"));
        cfg.setExposedHeaders(List.of("Authorization"));
        cfg.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}
