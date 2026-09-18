package co.edu.udistrital.cinepacho.model.local.funciones;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetalleSilla {
    private String id;
    private String tipo;      // "general", "preferential"
    private double precio;    // ← AGREGAR este campo
    private boolean disponible;
    private String compraId;
}