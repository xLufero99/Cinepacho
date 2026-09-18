package co.edu.udistrital.cinepacho.controller;

import co.edu.udistrital.cinepacho.model.central.empleados.Empleado;
import co.edu.udistrital.cinepacho.model.central.empleados.HistorialSede;
import co.edu.udistrital.cinepacho.service.EmpleadoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/empleados")
@RequiredArgsConstructor
public class EmpleadoController {

    private final EmpleadoService empleadoService;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<Empleado>> getAll() {
        return ResponseEntity.ok(empleadoService.obtenerTodosLosEmpleados());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Empleado> getById(@PathVariable String id) {
        return empleadoService.obtenerEmpleadoPorId(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/usuario/{usuarioId}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'EMPLEADO')")
    public ResponseEntity<Empleado> getByUsuarioId(@PathVariable String usuarioId) {
        return empleadoService.obtenerEmpleadoPorUsuarioId(usuarioId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/codigo/{codigo}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Empleado> getByCodigo(@PathVariable String codigo) {
        return empleadoService.obtenerEmpleadoPorCodigo(codigo)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/sede/{sedeId}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<Empleado>> getBySede(@PathVariable String sedeId) {
        return ResponseEntity.ok(empleadoService.obtenerEmpleadosPorSede(sedeId));
    }

    @GetMapping("/rol/{rol}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<Empleado>> getByRol(@PathVariable String rol) {
        return ResponseEntity.ok(empleadoService.obtenerEmpleadosPorRol(rol));
    }

   @GetMapping("/{codigo}/historial")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public ResponseEntity<List<HistorialSede>> getHistorial(@PathVariable String codigo) {
    return ResponseEntity.ok(empleadoService.obtenerHistorialEmpleados(codigo));
}

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Empleado> create(@Valid @RequestBody Empleado empleado) {
        return ResponseEntity.status(HttpStatus.CREATED).body(empleadoService.crearEmpleado(empleado));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Empleado> update(@PathVariable String id, @Valid @RequestBody Empleado empleado) {
        return ResponseEntity.ok(empleadoService.actualizarEmpleado(id, empleado));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        empleadoService.eliminarEmpleado(id);
        return ResponseEntity.noContent().build();
    }
}