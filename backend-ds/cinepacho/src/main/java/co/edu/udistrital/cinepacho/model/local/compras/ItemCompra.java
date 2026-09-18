package co.edu.udistrital.cinepacho.model.local.compras;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemCompra {
    private String tipo; // "boleta" | "snack"
    private String referenciaId; // funcionId para boleta, inventarioId para snack
    private String sillaId; // null si es snack, "G1"/"P2" si es boleta
    private String detalle;
    private int cantidad;
    private double precioUnitario;
    private double subtotal;
}