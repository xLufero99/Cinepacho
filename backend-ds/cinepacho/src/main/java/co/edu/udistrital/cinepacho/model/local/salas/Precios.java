package co.edu.udistrital.cinepacho.model.local.salas;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Precios {
    @Builder.Default
    private double general = 11000.0;
    
    @Builder.Default
    private double preferencial = 15000.0;
}