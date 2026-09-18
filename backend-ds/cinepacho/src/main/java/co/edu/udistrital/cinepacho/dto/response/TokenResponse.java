package co.edu.udistrital.cinepacho.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenResponse {
    
    private String accessToken;
    
    private String refreshToken;
    
    private String tokenType;
    
    private long expiresIn;
    
    private String usuario;
    
    private String rol;

    private String usuarioId; 
}
