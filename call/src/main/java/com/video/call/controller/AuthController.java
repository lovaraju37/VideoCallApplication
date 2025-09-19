package com.video.call.controller;

import com.video.call.model.User;
import com.video.call.repository.UserRepository;
import com.video.call.security.JwtUtil;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder,
                          AuthenticationManager authManager, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authManager = authManager;
        this.jwtUtil = jwtUtil;
    }

    public static record RegisterRequest(@NotBlank String username, @NotBlank String password,
                                         String displayName) { }
    public static record LoginRequest(@NotBlank String username, @NotBlank String password) { }
    public static record AuthResponse(String token, String username, String displayName) { }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        if (userRepository.existsByUsername(req.username())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
        }
        User u = new User();
        u.setUsername(req.username());
        u.setPasswordHash(passwordEncoder.encode(req.password()));
        u.setDisplayName(req.displayName() != null && !req.displayName().isBlank() ? req.displayName() : req.username());
        u.setRoles("USER");
        userRepository.save(u);
        String token = jwtUtil.generateToken(u.getUsername(), Map.of("displayName", u.getDisplayName(), "roles", u.getRoles()));
        return ResponseEntity.ok(new AuthResponse(token, u.getUsername(), u.getDisplayName()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.username(), req.password()));
        String username = auth.getName();
        User u = userRepository.findByUsername(username).orElseThrow();
        String token = jwtUtil.generateToken(u.getUsername(), Map.of("displayName", u.getDisplayName(), "roles", u.getRoles()));
        return ResponseEntity.ok(new AuthResponse(token, u.getUsername(), u.getDisplayName()));
    }
}
