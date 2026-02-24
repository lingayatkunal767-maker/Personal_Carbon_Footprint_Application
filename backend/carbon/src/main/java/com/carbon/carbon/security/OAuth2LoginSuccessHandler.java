package com.carbon.carbon.security;


import com.carbon.carbon.entity.User;
import com.carbon.carbon.repository.UserRepository;
import com.carbon.carbon.security.JwtUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.util.Optional;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        // Auto-register user if not exists
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name != null ? name : "Google User");
            newUser.setPassword(""); // No password for social login
            userRepository.save(newUser);
        }

        // Generate JWT
        String token = jwtUtil.generateToken(email);

        // Redirect to frontend with token as query param
        String redirectUrl = "http://localhost:5174/dashboard?token=" + token;
        response.sendRedirect(redirectUrl);
    }
}
