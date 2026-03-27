package com.sustainability.tracker.service;

import com.sustainability.tracker.dto.AuthRequest;
import com.sustainability.tracker.dto.AuthResponse;
import com.sustainability.tracker.entity.AdminProfile;
import com.sustainability.tracker.entity.User;
import com.sustainability.tracker.repository.AdminProfileRepository;
import com.sustainability.tracker.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AdminProfileRepository adminProfileRepository;

    @InjectMocks
    private AuthService authService;

    @Test
    @SuppressWarnings("null")
    public void registerAdminCreatesAdminProfileRecord() {
        AuthRequest request = new AuthRequest("Platform Admin", "admin@example.com", "Admin@123");

        when(userRepository.existsByEmailIgnoreCase("admin@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0, User.class);
            user.setId(10L);
            return user;
        });
        when(adminProfileRepository.findByUser_Id(10L)).thenReturn(Optional.empty());
        when(adminProfileRepository.save(any(AdminProfile.class))).thenAnswer(invocation -> invocation.getArgument(0, AdminProfile.class));

        AuthResponse response = authService.registerAdmin(request);

        assertTrue(response.isSuccess());
        assertEquals("ADMIN", response.getRole());
        ArgumentCaptor<AdminProfile> adminProfileCaptor = ArgumentCaptor.forClass(AdminProfile.class);
        verify(adminProfileRepository, times(1)).save(adminProfileCaptor.capture());
        AdminProfile savedProfile = adminProfileCaptor.getValue();
        assertNotNull(savedProfile.getUser());
        assertEquals(10L, savedProfile.getUser().getId());
        assertEquals("ADMIN", savedProfile.getAccessLevel());
        assertEquals("Platform Operations", savedProfile.getDepartment());
    }

    @Test
    @SuppressWarnings("null")
    public void loginAdminBackfillsMissingAdminProfileAndUpdatesLastLogin() {
        User admin = new User();
        admin.setId(21L);
        admin.setName("Existing Admin");
        admin.setEmail("existing.admin@example.com");
        admin.setRole("ADMIN");
        admin.setIsActive(true);
        admin.setPasswordHash(new BCryptPasswordEncoder().encode("Secret@123"));

        when(userRepository.findByEmailIgnoreCase("existing.admin@example.com")).thenReturn(Optional.of(admin));
        when(adminProfileRepository.findByUser_Id(21L)).thenReturn(Optional.empty());
        when(adminProfileRepository.save(any(AdminProfile.class))).thenAnswer(invocation -> invocation.getArgument(0, AdminProfile.class));

        AuthResponse response = authService.loginAdmin(new AuthRequest(null, "existing.admin@example.com", "Secret@123"));

        assertTrue(response.isSuccess());
        assertEquals("ADMIN", response.getRole());
        ArgumentCaptor<AdminProfile> adminProfileCaptor = ArgumentCaptor.forClass(AdminProfile.class);
        verify(adminProfileRepository, times(1)).save(adminProfileCaptor.capture());
        AdminProfile savedProfile = adminProfileCaptor.getValue();
        assertNotNull(savedProfile.getUser());
        assertEquals(21L, savedProfile.getUser().getId());
        assertNotNull(savedProfile.getLastLoginAt());
    }
}