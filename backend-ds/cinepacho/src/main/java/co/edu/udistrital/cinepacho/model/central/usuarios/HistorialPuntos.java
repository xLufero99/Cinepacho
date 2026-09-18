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
public class HistorialPuntos {
    private String id;
    private LocalDateTime fecha;
    private int puntos;
    private String tipo; // GANADA_BOLETA, GANADA_SNACK, CANJEADA_BOLETA, REEMBOLSO
    private String motivo;
    private String compraId;
    private String usuarioId;
}