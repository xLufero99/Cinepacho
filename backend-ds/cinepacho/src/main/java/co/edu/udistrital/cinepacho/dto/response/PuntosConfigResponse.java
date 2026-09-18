package co.edu.udistrital.cinepacho.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PuntosConfigResponse {
    private int puntosBoletas;
    private int puntosSnacks;
    private int puntosRedencion;
    private int vigenciaBoletaGratisMeses;
    private String tipoBoletaGratis;
}