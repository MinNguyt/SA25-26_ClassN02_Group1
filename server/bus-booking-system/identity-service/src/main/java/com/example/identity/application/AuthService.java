package com.example.identity.application;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.identity.domain.model.User;
import com.example.identity.domain.repository.UserRepository;
import com.example.identity.infrastructure.exception.ConflictException;
import com.example.identity.infrastructure.exception.InvalidCredentialsException;
import com.example.identity.infrastructure.exception.ResourceNotFoundException;
import com.example.identity.infrastructure.security.JwtTokenProvider;
import com.example.identity.presentation.dto.LoginRequest;
import com.example.identity.presentation.dto.LoginResponse;
import com.example.identity.presentation.dto.RegisterRequest;
import com.example.identity.presentation.dto.RegisterResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid password");
        }

        String token = jwtTokenProvider.generateAccessToken(user.getEmail());

        return LoginResponse.builder()
                .token(token)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public RegisterResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already exists: " + request.getEmail());
        }

        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("Username already exists: " + request.getUsername());
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .age(request.getAge())
                .role("user")
                .isActive(1)
                .build();

        userRepository.save(user);

        return RegisterResponse.builder()
                .message("User registered successfully")
                .email(user.getEmail())
                .username(user.getUsername())
                .build();
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
    }
}
