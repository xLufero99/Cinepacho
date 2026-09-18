package co.edu.udistrital.cinepacho.controller;

import co.edu.udistrital.cinepacho.dto.response.reportes.EmpleadoMovilidadDto;
import co.edu.udistrital.cinepacho.dto.response.reportes.DashboardIngresosDto;
import co.edu.udistrital.cinepacho.dto.response.reportes.ReporteMensualSedeDto;
import co.edu.udistrital.cinepacho.service.impl.ReporteServiceImpl;
import co.edu.udistrital.cinepacho.model.local.compras.Compra;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reportes")
@RequiredArgsConstructor
public class ReporteController {

    private final ReporteServiceImpl reporteService;

    @GetMapping("/ventas-mensuales")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<ReporteMensualSedeDto>> getVentasMensuales(@RequestParam int year) {
        return ResponseEntity.ok(reporteService.operacionesMensualesPorSede(year));
    }

    @GetMapping("/movilidad-empleados")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<EmpleadoMovilidadDto>> getMovilidadEmpleados(@RequestParam(defaultValue = "12") int meses) {
        return ResponseEntity.ok(reporteService.analisisMovilidadEmpleados(meses));
    }

    @GetMapping("/dashboard/ingresos")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<DashboardIngresosDto> getIngresosDashboard() {
        return ResponseEntity.ok(reporteService.obtenerIngresosDashboard());
    }

    @GetMapping("/compras/sede/{sedeId}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<Compra>> getComprasPorSedeLocal(@PathVariable String sedeId) {
        return ResponseEntity.ok(reporteService.obtenerComprasPorSedeLocal(sedeId));
    }
}