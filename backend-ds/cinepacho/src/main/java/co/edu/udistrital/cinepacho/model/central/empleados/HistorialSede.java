package co.edu.udistrital.cinepacho.model.central.empleados;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HistorialSede {
    private String sedeId;
    private String cargo;
    private LocalDate fechaInicio;
    private LocalDate fechaFin; // null si es el actual
}