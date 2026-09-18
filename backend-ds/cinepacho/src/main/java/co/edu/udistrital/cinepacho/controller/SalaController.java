package co.edu.udistrital.cinepacho.controller;

import co.edu.udistrital.cinepacho.model.local.salas.Sala;
import co.edu.udistrital.cinepacho.service.SalaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/salas")
@RequiredArgsConstructor
public class SalaController {

    private final SalaService salaService;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('EMPLEADO')")
    public ResponseEntity<List<Sala>> getAll() {
        return ResponseEntity.ok(salaService.obtenerTodasLasSalas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sala> getById(@PathVariable String id) {
        return salaService.obtenerSalaPorId(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/sede/{sedeId}")
    public ResponseEntity<List<Sala>> getBySede(@PathVariable String sedeId) {
        return ResponseEntity.ok(salaService.obtenerSalasPorSede(sedeId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Sala> create(@Valid @RequestBody Sala sala) {
        return ResponseEntity.status(HttpStatus.CREATED).body(salaService.crearSala(sala));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Sala> update(@PathVariable String id, @Valid @RequestBody Sala sala) {
        return ResponseEntity.ok(salaService.actualizarSala(id, sala));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        salaService.eliminarSala(id);
        return ResponseEntity.noContent().build();
    }
}