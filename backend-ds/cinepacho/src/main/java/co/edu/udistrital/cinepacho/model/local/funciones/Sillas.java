package co.edu.udistrital.cinepacho.model.local.funciones;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Sillas {
    @Builder.Default
    private List<DetalleSilla> general = new ArrayList<>();
    
    @Builder.Default
    private List<DetalleSilla> preferencial = new ArrayList<>();
}