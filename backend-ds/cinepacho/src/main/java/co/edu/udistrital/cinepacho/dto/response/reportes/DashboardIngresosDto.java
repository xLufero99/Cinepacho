package co.edu.udistrital.cinepacho.dto.response.reportes;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardIngresosDto {
    private double ingresosBoletas;
    private double ingresosSnacks;
    private double ingresosTotales;
    private int totalCompras;
}