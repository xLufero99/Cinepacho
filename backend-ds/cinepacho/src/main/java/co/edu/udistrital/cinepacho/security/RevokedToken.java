package co.edu.udistrital.cinepacho.security;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

//Representa un JWT revocado para impedir su reutilizacion, guarda el token, el usuario asociado y la ventana temporal de revocacion/expiracion.
//Flujo: JWT revocado -> RevokedToken -> RevokedTokenRepository -> JwtFilter / TokenRevocationService.
// Uso minimo: persistir token, usuario y ventana de expiracion de la revocacion.

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "revoked_tokens")
public class RevokedToken {

    @Id
    private String id;

    private String token;

    private String usuarioId;

    private LocalDateTime revokedAt;

    private LocalDateTime expiredAt;

    //Indica si el token revocado ya quedo expirado en el tiempo actual.
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiredAt);
    }
}
