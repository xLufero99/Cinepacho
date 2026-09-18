package co.edu.udistrital.cinepacho.controller;

import co.edu.udistrital.cinepacho.model.local.funciones.Funcion;
import co.edu.udistrital.cinepacho.service.impl.FuncionServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/funciones")
@RequiredArgsConstructor
public class FuncionController {

    private final FuncionServiceImpl funcionService;

    @GetMapping
    public ResponseEntity<List<Funcion>> getAll() {
        return ResponseEntity.ok(funcionService.obtenerTodasLasFunciones());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Funcion> getById(@PathVariable String id) {
        return funcionService.obtenerFuncionPorId(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/sede/{sedeId}")
    public ResponseEntity<List<Funcion>> getBySede(@PathVariable String sedeId) {
        return ResponseEntity.ok(funcionService.obtenerFuncionesPorSede(sedeId));
    }

    @GetMapping("/pelicula/{peliculaId}")
    public ResponseEntity<List<Funcion>> getByPelicula(@PathVariable String peliculaId) {
        return ResponseEntity.ok(funcionService.obtenerFuncionesPorPelicula(peliculaId));
    }

    @GetMapping("/sala/{salaId}")
    public ResponseEntity<List<Funcion>> getBySala(@PathVariable String salaId) {
        return ResponseEntity.ok(funcionService.obtenerFuncionesPorSala(salaId));
    }

    @GetMapping("/fechas")
    public ResponseEntity<List<Funcion>> getBetweenDates(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(funcionService.obtenerFuncionesEntreFechas(start, end));
    }

    @GetMapping("/{id}/sillas/disponibles")
    public ResponseEntity<?> getSillasDisponibles(@PathVariable String id) {
        return funcionService.obtenerFuncionPorId(id)
            .map(funcion -> {
                long disponibles = funcion.getSillas().getGeneral().stream().filter(s -> s.isDisponible()).count() +
                    funcion.getSillas().getPreferencial().stream().filter(s -> s.isDisponible()).count();
                return ResponseEntity.ok(disponibles);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/sillas/disponibilidad")
    public ResponseEntity<?> getDisponibilidadDetallada(@PathVariable String id) {
        return funcionService.obtenerFuncionPorId(id)
            .map(funcion -> ResponseEntity.ok(funcion.getSillas()))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Funcion> create(@Valid @RequestBody Funcion funcion) {
        return ResponseEntity.status(HttpStatus.CREATED).body(funcionService.crearFuncion(funcion));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Funcion> update(@PathVariable String id, @Valid @RequestBody Funcion funcion) {
        return ResponseEntity.ok(funcionService.actualizarFuncion(id, funcion));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        funcionService.eliminarFuncion(id);
        return ResponseEntity.noContent().build();
    }
}