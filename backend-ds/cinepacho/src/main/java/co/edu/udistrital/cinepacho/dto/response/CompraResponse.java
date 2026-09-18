package co.edu.udistrital.cinepacho.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CompraResponse {
    
    private String id;
    
    private String usuarioId;
    
    private String sedeId;
    
    private List<SillaResponse> sillas;
    
    private List<SnackResponse> snacks;
    
    private double subtotal;
    
    private double tarifa;
    
    private double total;
    
    private int puntosBoletas;
    
    private int puntosSnacks;
    
    private int puntosTotal;
    
    private String estado;
    
    private LocalDateTime fecha;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SillaResponse {
        private String id;
        private String tipo;
        private double precio;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SnackResponse {
        private String id;
        private String nombre;
        private int cantidad;
        private double precioUnitario;
        private double subtotal;
    }
}
