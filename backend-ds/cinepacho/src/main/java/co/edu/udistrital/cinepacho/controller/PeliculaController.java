package co.edu.udistrital.cinepacho.controller;

import co.edu.udistrital.cinepacho.model.central.Pelicula;
import co.edu.udistrital.cinepacho.service.PeliculaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/peliculas")
@RequiredArgsConstructor
public class PeliculaController {

    private final PeliculaService peliculaService;

    @GetMapping
    public ResponseEntity<List<Pelicula>> getAll() {
        return ResponseEntity.ok(peliculaService.obtenerTodasLasPeliculas());
    }

    @GetMapping("/cartelera")
    public ResponseEntity<List<Pelicula>> getCartelera() {
        return ResponseEntity.ok(peliculaService.obtenerPeliculasEnCartelera());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pelicula> getById(@PathVariable String id) {
        return peliculaService.obtenerPeliculaPorId(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Pelicula> create(@Valid @RequestBody Pelicula pelicula) {
        return ResponseEntity.status(HttpStatus.CREATED).body(peliculaService.crearPelicula(pelicula));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Pelicula> update(@PathVariable String id, @Valid @RequestBody Pelicula pelicula) {
        return ResponseEntity.ok(peliculaService.actualizarPelicula(id, pelicula));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        peliculaService.eliminarPelicula(id);
        return ResponseEntity.noContent().build();
    }
}