package co.edu.udistrital.cinepacho.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrearCompraRequest {
    
    @NotBlank(message = "usuarioId es requerido")
    private String usuarioId;
    
    @NotBlank(message = "sedeId es requerido")
    private String sedeId;
    
    @NotEmpty(message = "Debe seleccionar al menos una silla")
    @Size(max = 20, message = "Maximo 20 sillas por transaccion")
    private List<String> sillaIds;
    
    @NotEmpty(message = "Debe seleccionar al menos un snack")
    @Valid
    private List<ItemInventarioRequest> snacks;
    
    @NotBlank(message = "Metodo de pago requerido")
    @Pattern(regexp = "TARJETA|EFECTIVO|TRANSFERENCIA", message = "Metodo de pago invalido")
    private String metodoPago;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemInventarioRequest {
        @NotBlank(message = "inventarioId requerido")
        private String inventarioId;
        
        @Min(value = 1, message = "Cantidad minima es 1")
        @Max(value = 10, message = "Cantidad maxima es 10 por producto")
        private int cantidad;
    }
}
