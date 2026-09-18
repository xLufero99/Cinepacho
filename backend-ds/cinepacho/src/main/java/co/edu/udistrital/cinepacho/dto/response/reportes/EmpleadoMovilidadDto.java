package co.edu.udistrital.cinepacho.dto.response.reportes;

import java.util.List;
import co.edu.udistrital.cinepacho.model.central.empleados.HistorialSede;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmpleadoMovilidadDto {
    private String empleadoId;
    private String codigoEmpleado;
    private String usuarioId;
    private int movimientos;
    private List<HistorialSede> historialSedes;
}
