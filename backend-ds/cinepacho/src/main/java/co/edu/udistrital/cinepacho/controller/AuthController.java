package co.edu.udistrital.cinepacho.controller;

import co.edu.udistrital.cinepacho.dto.request.LoginRequest;
import co.edu.udistrital.cinepacho.dto.response.TokenResponse;
import co.edu.udistrital.cinepacho.model.central.Login;
import co.edu.udistrital.cinepacho.model.central.empleados.Empleado;
import co.edu.udistrital.cinepacho.model.central.usuarios.Usuarios;
import co.edu.udistrital.cinepacho.repository.central.LoginRepository;
import co.edu.udistrital.cinepacho.repository.central.EmpleadosRepository;
import co.edu.udistrital.cinepacho.repository.central.UsuariosRepository;
import co.edu.udistrital.cinepacho.security.AuthRateLimitService;
import co.edu.udistrital.cinepacho.security.JwtTokenProvider;
import co.edu.udistrital.cinepacho.security.TokenRevocationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UsuariosRepository usuariosRepository;
    private final LoginRepository loginRepository;
    private final EmpleadosRepository empleadosRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthRateLimitService rateLimitService;
    private final TokenRevocationService tokenRevocationService;

    @PostMapping("/create-login")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> createLoginForUser(@RequestBody Login loginRequest) {
        // verify user exists
        if (loginRequest.getUserId() == null || loginRequest.getUserId().isBlank()) {
            return ResponseEntity.badRequest().body("userId is required");
        }

        var userOpt = usuariosRepository.findById(loginRequest.getUserId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Usuario no encontrado");
        }

        if (loginRepository.existsByUsername(loginRequest.getUsername())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Nombre de usuario ya existe");
        }

        if (loginRequest.getPassword() == null || loginRequest.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body("Password es requerido");
        }

        var toSave = Login.builder()
            .userId(loginRequest.getUserId())
            .username(loginRequest.getUsername())
            .password(passwordEncoder.encode(loginRequest.getPassword()))
            .rol(loginRequest.getRol())
            .build();

        var saved = loginRepository.save(toSave);
        saved.setPassword(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        String identifier = request.getEmail();
        String rateKey = rateLimitService.buildKey(httpRequest, identifier);
        
        if (!rateLimitService.tryConsume(rateKey)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body("Demasiados intentos fallidos. Intente nuevamente en 10 minutos.");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(identifier, request.getContrasena())
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            Login login = loginRepository.findByUsername(identifier)
                .orElseThrow(() -> new RuntimeException("Login no encontrado"));

            Usuarios usuario = usuariosRepository.findById(login.getUserId())
                .orElseThrow(() -> new RuntimeException("Usuario asociado al login no encontrado"));

            String effectiveRole = empleadosRepository.findByUsuarioId(usuario.getId())
                .map(Empleado::getId)
                .map(employeeId -> "EMPLEADO")
                .orElse(usuario.getRol());

            usuario.setRol(effectiveRole);
            
            String accessToken = jwtTokenProvider.generateAccessToken(usuario);
            String refreshToken = jwtTokenProvider.generateRefreshToken(usuario);
            
            rateLimitService.reset(rateKey);
            
            return ResponseEntity.ok(TokenResponse.builder()
    .accessToken(accessToken)
    .refreshToken(refreshToken)
    .tokenType("Bearer")
    .expiresIn(86400000L)
    .usuario(usuario.getNombre() + " " + usuario.getApellido())
    .rol(usuario.getRol())
    .usuarioId(usuario.getId())  // ← AGREGAR ESTA LÍNEA
    .build());
                
        } catch (AuthenticationException e) {
            rateLimitService.recordFailure(rateKey);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Credenciales inválidas");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody Usuarios usuario) {
        if (usuariosRepository.findByEmail(usuario.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("El email ya está registrado");
        }
        
        if (usuariosRepository.findByCedula(usuario.getCedula()).isPresent()) {
            return ResponseEntity.badRequest().body("La cédula ya está registrada");
        }
        
        usuario.setContrasena(passwordEncoder.encode(usuario.getContrasena()));
        if (usuario.getRol() == null) usuario.setRol("CLIENTE");
        Usuarios saved = usuariosRepository.save(usuario);
        
        Login login = Login.builder()
            .userId(saved.getId())
            .username(saved.getEmail())
            .password(saved.getContrasena())
            .rol(saved.getRol())
            .build();
        loginRepository.save(login);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String refreshToken) {
        if (refreshToken != null && refreshToken.startsWith("Bearer ")) {
            refreshToken = refreshToken.substring(7);
        }
        
        if (!jwtTokenProvider.validateToken(refreshToken) || 
            !"REFRESH".equals(jwtTokenProvider.getTokenTypeFromToken(refreshToken))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token inválido");
        }
        
        String username = jwtTokenProvider.getUsernameFromToken(refreshToken);
        String role = jwtTokenProvider.getRoleFromToken(refreshToken);
        
        String newAccessToken = jwtTokenProvider.generateToken(username, role);
        
        return ResponseEntity.ok(TokenResponse.builder()
            .accessToken(newAccessToken)
            .tokenType("Bearer")
            .expiresIn(86400000L)
            .build());
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            tokenRevocationService.revokeToken(token);
        }
        return ResponseEntity.ok("Logout exitoso");
    }
}