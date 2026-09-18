package co.edu.udistrital.cinepacho.controller;

import co.edu.udistrital.cinepacho.model.central.usuarios.Calificacion;
import co.edu.udistrital.cinepacho.model.central.usuarios.Usuarios;
import co.edu.udistrital.cinepacho.repository.central.UsuariosRepository;
import co.edu.udistrital.cinepacho.service.CalificacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/calificaciones")
@RequiredArgsConstructor
public class CalificacionController {

    private final CalificacionService calificacionService;
    private final UsuariosRepository usuariosRepository;  // ✅ INYECTADO

    @PostMapping
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<Calificacion> create(
        @Valid @RequestBody Calificacion calificacion,
        Authentication authentication  // ✅ AGREGADO
    ) {
        // Obtener el usuario logueado
        String email = authentication.getName();
        Usuarios usuario = usuariosRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Asignar usuarioId y fecha automáticamente
        calificacion.setUsuarioId(usuario.getId());
        calificacion.setFecha(LocalDateTime.now());
        
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(calificacionService.crearCalificacion(calificacion));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<Calificacion>> getAll() {
        return ResponseEntity.ok(calificacionService.obtenerTodasLasCalificaciones());
    }

    @GetMapping("/pelicula/{peliculaId}")
    public ResponseEntity<List<Calificacion>> getByPelicula(@PathVariable String peliculaId) {
        return ResponseEntity.ok(calificacionService.obtenerCalificacionesPorPelicula(peliculaId));
    }

    @GetMapping("/pelicula/{peliculaId}/promedio")
    public ResponseEntity<Double> getPromedioByPelicula(@PathVariable String peliculaId) {
        return ResponseEntity.ok(calificacionService.obtenerPromedioCalificaciones(peliculaId));
    }

    @GetMapping("/usuario/{usuarioId}")
    @PreAuthorize("hasRole('CLIENTE') or hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<Calificacion>> getByUsuario(@PathVariable String usuarioId) {
        return ResponseEntity.ok(calificacionService.obtenerCalificacionesPorUsuario(usuarioId));
    }

    @GetMapping("/sede/{sedeId}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<Calificacion>> getBySede(@PathVariable String sedeId) {
        return ResponseEntity.ok(calificacionService.obtenerCalificacionesPorSede(sedeId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<Calificacion> update(
        @PathVariable String id, 
        @Valid @RequestBody Calificacion calificacion
    ) {
        return ResponseEntity.ok(calificacionService.actualizarCalificacion(id, calificacion));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CLIENTE') or hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        calificacionService.eliminarCalificacion(id);
        return ResponseEntity.noContent().build();
    }
}