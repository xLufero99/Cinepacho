package co.edu.udistrital.cinepacho.security;

import co.edu.udistrital.cinepacho.model.central.Login;
import co.edu.udistrital.cinepacho.repository.central.LoginRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

//Traduce un usuario persistido en un UserDetails entendible por Spring Security.
//Flujo: Username -> CustomUserDetailsService -> LoginRepository -> Spring Security UserDetails.
//Uso minimo: cargar credenciales persistidas y normalizar el rol a formato ROLE_*.

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final LoginRepository loginRepository;
	
    public CustomUserDetailsService(LoginRepository loginRepository) {
        this.loginRepository = loginRepository;
    }

    //Busca el usuario por username y construye las credenciales usadas en autenticacion.
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Login login = loginRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException(
                "Usuario no encontrado con username: " + username));
        String normalizedRole = login.getRol() == null
            ? "CLIENTE"
            : login.getRol().replace("ROLE_", "").trim().toUpperCase();
        return User.builder()
            .username(login.getUsername())
            .password(login.getPassword())
            .roles(normalizedRole)
            .accountExpired(false)
            .accountLocked(false)
            .credentialsExpired(false)
            .disabled(false)
            .build();
    }
}
