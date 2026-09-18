package co.edu.udistrital.cinepacho.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpMethod;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final CustomUserDetailsService customUserDetailsService;
    
    public SecurityConfig(JwtFilter jwtFilter, CustomUserDetailsService customUserDetailsService) {
        this.jwtFilter = jwtFilter;
        this.customUserDetailsService = customUserDetailsService;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(customUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        return new ProviderManager(List.of(authenticationProvider()));
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // ✅ AGREGAR DOMINIOS DE PRODUCCIÓN Y PUERTO 3000
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:3000",
            "https://www.cinepacho3.com",
            "https://cinepacho3.com"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                
                // ========== ENDPOINTS PÚBLICOS (sin autenticación) ==========
                .requestMatchers("/auth/login/**", "/auth/refresh", "/auth/register/**").permitAll()

                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/funciones/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/salas/**").permitAll()
				.requestMatchers("/peliculas/**").permitAll()
                .requestMatchers("/cliente/connected").permitAll()
                .requestMatchers("/cliente/cartelera").permitAll()
                .requestMatchers("/cliente/asientos-disponibles").permitAll()
                .requestMatchers("/cliente/confiteria").permitAll()
                .requestMatchers("/cliente/mis-puntos/config").permitAll()
                .requestMatchers("/inventario/publico/**").permitAll()
                .requestMatchers("/sedes/publicas/**").permitAll()
                .requestMatchers("/administrador/listar-sedes").permitAll()
                
                // ========== ENDPOINTS PROTEGIDOS ==========
                .requestMatchers("/cliente/**").hasRole("CLIENTE")
                .requestMatchers("/empleado/**").hasRole("EMPLEADO")
                .requestMatchers("/administrador/**").hasRole("ADMINISTRADOR")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .httpBasic(basic -> basic.disable())
            .formLogin(form -> form.disable());

        return http.build();
    }
}