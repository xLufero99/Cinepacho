package co.edu.udistrital.cinepacho.model.central.usuarios;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoletaRegalo {
    private LocalDateTime generada;
    private LocalDateTime expira; // 6 meses después de generada
    private boolean usada;
    private String peliculaId;
}