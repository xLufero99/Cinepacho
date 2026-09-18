package co.edu.udistrital.cinepacho.security;

import java.time.LocalDateTime;
import java.time.ZoneId;

import org.springframework.stereotype.Service;

import co.edu.udistrital.cinepacho.repository.central.RevokedTokenRepository;

@Service
//Maneja la revocacion de tokens JWT, el flujo normal empieza al verificar si ya existe, luego calcular expiracion y termina al persistir el token revocado.
//Flujo: Token JWT -> TokenRevocationService -> RevokedTokenRepository -> JwtFilter.
//Uso minimo: revocar el token actual y evitar su reutilizacion hasta que expire.
public class TokenRevocationService {

    private final RevokedTokenRepository revokedTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
	

    public TokenRevocationService(RevokedTokenRepository revokedTokenRepository, JwtTokenProvider jwtTokenProvider) {
        this.revokedTokenRepository = revokedTokenRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    //Registra un token como revocado para impedir que vuelva a autenticarse.
    public void revokeToken(String token) {
        if (token == null || token.isBlank()) {
            return;
        }

        if (revokedTokenRepository.existsByToken(token)) {
            return;
        }

        LocalDateTime expiredAt = jwtTokenProvider.getExpirationDateFromToken(token)
            .toInstant()
            .atZone(ZoneId.systemDefault())
            .toLocalDateTime();

        RevokedToken revokedToken = RevokedToken.builder()
            .token(token)
            .usuarioId(jwtTokenProvider.getUserIdFromToken(token))
            .revokedAt(LocalDateTime.now())
            .expiredAt(expiredAt)
            .build();

        revokedTokenRepository.save(revokedToken);
    }

    //Consulta si el token ya fue revocado.
    public boolean isRevoked(String token) {
        return token != null && revokedTokenRepository.existsByToken(token);
    }
}