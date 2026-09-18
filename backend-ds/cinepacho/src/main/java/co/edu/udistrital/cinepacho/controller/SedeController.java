package co.edu.udistrital.cinepacho.controller;

import co.edu.udistrital.cinepacho.model.central.Sede;
import co.edu.udistrital.cinepacho.service.SedeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sedes")
@RequiredArgsConstructor
public class SedeController {

    private final SedeService sedeService;

    @GetMapping
    public ResponseEntity<List<Sede>> getAll() {
        return ResponseEntity.ok(sedeService.obtenerTodasLasSedes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sede> getById(@PathVariable String id) {
        return sedeService.obtenerSedePorId(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/nombre/{nombre}")
    public ResponseEntity<Sede> getByNombre(@PathVariable String nombre) {
        return sedeService.obtenerSedePorNombre(nombre)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Sede> create(@Valid @RequestBody Sede sede) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sedeService.crearSede(sede));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Sede> update(@PathVariable String id, @Valid @RequestBody Sede sede) {
        return ResponseEntity.ok(sedeService.actualizarSede(id, sede));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        sedeService.eliminarSede(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/salas/cantidad")
    public ResponseEntity<Integer> getCantidadSalas(@PathVariable String id) {
        return ResponseEntity.ok(sedeService.obtenerCantidadSalas(id));
    }

    @GetMapping("/listar-sedes")
public ResponseEntity<List<Sede>> listarSedes() {
    return ResponseEntity.ok(sedeService.obtenerTodasLasSedes());
}
}


