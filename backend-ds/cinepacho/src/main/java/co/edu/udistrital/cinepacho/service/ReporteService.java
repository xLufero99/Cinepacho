package co.edu.udistrital.cinepacho.service;

import co.edu.udistrital.cinepacho.dto.response.reportes.DashboardIngresosDto;
import co.edu.udistrital.cinepacho.dto.response.reportes.ReporteMensualSedeDto;
import co.edu.udistrital.cinepacho.dto.response.reportes.EmpleadoMovilidadDto;
import java.util.List;

public interface ReporteService {

    List<ReporteMensualSedeDto> operacionesMensualesPorSede(int year);

    List<EmpleadoMovilidadDto> analisisMovilidadEmpleados(int meses);

    DashboardIngresosDto obtenerIngresosDashboard();

}