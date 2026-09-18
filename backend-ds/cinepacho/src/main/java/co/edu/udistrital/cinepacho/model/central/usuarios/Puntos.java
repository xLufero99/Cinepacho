package co.edu.udistrital.cinepacho.model.central.usuarios;

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
public class Puntos {
    @Builder.Default
    private int total = 0;

    @Builder.Default
    private List<HistorialPuntos> historial = new ArrayList<>();

    @Builder.Default
    private List<BoletaRegalo> boletasRegalo = new ArrayList<>();
}