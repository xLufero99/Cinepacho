package co.edu.udistrital.cinepacho.dto.response.reportes;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReporteMensualSedeDto {
    private String sedeId;
    private int year;
    private int mes;
    private double totalVentas;
    private int totalCompras;
}
