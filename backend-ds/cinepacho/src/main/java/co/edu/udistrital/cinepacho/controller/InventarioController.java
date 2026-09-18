package co.edu.udistrital.cinepacho.controller;

import co.edu.udistrital.cinepacho.model.local.Inventario;
import co.edu.udistrital.cinepacho.service.InventarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventario")
@RequiredArgsConstructor
@Slf4j
public class InventarioController {

    private final InventarioService inventarioService;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('EMPLEADO')")
    public ResponseEntity<List<Inventario>> getAll() {
        return ResponseEntity.ok(inventarioService.obtenerTodosLosInventarios());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Inventario> getById(@PathVariable String id) {
        return inventarioService.obtenerInventarioPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/sede/{sedeId}")
    public ResponseEntity<List<Inventario>> getBySede(@PathVariable String sedeId) {
        log.info("Solicitud GET /inventario/sede/{} - delegando al servicio de inventario", sedeId);
        return ResponseEntity.ok(inventarioService.obtenerInventariosPorSede(sedeId));
    }

    @GetMapping("/publico/sede/{sedeId}")
    public ResponseEntity<List<Inventario>> getPublicBySede(@PathVariable String sedeId) {
        log.info("Solicitud GET /inventario/publico/sede/{} - acceso publico a inventario de confiteria", sedeId);
        return ResponseEntity.ok(inventarioService.obtenerInventariosPorSede(sedeId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Inventario> create(@Valid @RequestBody Inventario inventario) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventarioService.crearInventario(inventario));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Inventario> update(@PathVariable String id, @Valid @RequestBody Inventario inventario) {
        return ResponseEntity.ok(inventarioService.actualizarInventario(id, inventario));
    }

    @PatchMapping("/{id}/stock")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('EMPLEADO')")
    public ResponseEntity<Void> updateStock(@PathVariable String id, @RequestParam int cantidad,
            @RequestParam String sedeId) {
        log.info("Recibida petición PATCH /inventario/{}/stock?cantidad={}&sedeId={}", id, cantidad, sedeId);
        inventarioService.actualizarStock(id, cantidad, sedeId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/disponible")
    public ResponseEntity<Integer> getDisponible(@PathVariable String id) {
        return ResponseEntity.ok(inventarioService.obtenerDisponibleReal(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> delete(@PathVariable String id,
            @RequestParam(required = false) String sedeId) {
        if (sedeId != null && !sedeId.isBlank()) {
            inventarioService.eliminarInventario(id, sedeId);
        } else {
            inventarioService.eliminarInventario(id);
        }
        return ResponseEntity.noContent().build();
    }
}