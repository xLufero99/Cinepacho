package co.edu.udistrital.cinepacho.controller;

import co.edu.udistrital.cinepacho.dto.request.CrearCompraRequest;
import co.edu.udistrital.cinepacho.dto.response.CompraResponse;
import co.edu.udistrital.cinepacho.model.local.compras.Compra;
import co.edu.udistrital.cinepacho.model.local.compras.ItemCompra;
import co.edu.udistrital.cinepacho.service.impl.CompraServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/compras")
@RequiredArgsConstructor
public class CompraController {

    private final CompraServiceImpl compraService;
    private final co.edu.udistrital.cinepacho.service.impl.ReporteServiceImpl reporteService;

    @PostMapping
    @PreAuthorize("hasRole('CLIENTE') or hasRole('ADMINISTRADOR') or hasRole('EMPLEADO')")
    public ResponseEntity<Compra> create(@Valid @RequestBody Compra compra) {
        return ResponseEntity.status(HttpStatus.CREATED).body(compraService.crearCompra(compra));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<Compra>> getAll() {
        return ResponseEntity.ok(compraService.obtenerTodasLasCompras());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Compra> getById(@PathVariable String id) {
        return compraService.obtenerCompraPorId(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/usuario/{usuarioId}")
    @PreAuthorize("hasRole('CLIENTE') or hasRole('ADMINISTRADOR') or hasRole('EMPLEADO')")
    public ResponseEntity<List<Compra>> getByUsuario(@PathVariable String usuarioId) {
        return ResponseEntity.ok(compraService.obtenerComprasPorUsuario(usuarioId));
    }

    @GetMapping("/sede/{sedeId}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<Compra>> getBySede(@PathVariable String sedeId) {
        // Delegar a ReporteService para obtener compras desde la BD local de la sede (multi-tenant)
        return ResponseEntity.ok(reporteService.obtenerComprasPorSedeLocal(sedeId));
    }

    @PostMapping("/{id}/pagar")
    @PreAuthorize("hasRole('CLIENTE') or hasRole('ADMINISTRADOR') or hasRole('EMPLEADO')")
    public ResponseEntity<Void> procesarPago(@PathVariable String id) {
        compraService.procesarPago(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/total")
    public ResponseEntity<Double> getTotal(@PathVariable String id) {
        return ResponseEntity.ok(compraService.calcularTotal(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        compraService.eliminarCompra(id);
        return ResponseEntity.noContent().build();
    }
}