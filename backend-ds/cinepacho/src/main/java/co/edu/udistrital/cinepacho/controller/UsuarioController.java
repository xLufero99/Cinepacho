package co.edu.udistrital.cinepacho.controller;

import co.edu.udistrital.cinepacho.model.central.usuarios.Usuarios;
import co.edu.udistrital.cinepacho.service.HistorialPuntosService;
import co.edu.udistrital.cinepacho.service.PuntosService;
import co.edu.udistrital.cinepacho.service.UsuariosService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuariosService usuariosService;
    private final PuntosService puntosService;
    private final HistorialPuntosService historialPuntosService;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<Usuarios>> getAll() {
        return ResponseEntity.ok(usuariosService.obtenerTodosLosUsuarios());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR') or isAuthenticated()")
    public ResponseEntity<Usuarios> getById(@PathVariable String id) {
        return usuariosService.obtenerUsuarioPorId(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<Usuarios> getByEmail(@PathVariable String email) {
        return usuariosService.obtenerUsuarioPorEmail(email)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR') or isAuthenticated()")
    public ResponseEntity<Usuarios> update(@PathVariable String id, @RequestBody Usuarios usuario) {
        return ResponseEntity.ok(usuariosService.actualizarUsuario(id, usuario));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        usuariosService.eliminarUsuario(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/puntos")
    public ResponseEntity<Integer> getPuntos(@PathVariable String id) {
        return ResponseEntity.ok(puntosService.obtenerSaldoPuntos(id));
    }

    @GetMapping("/{id}/puntos/historial")
    public ResponseEntity<?> getHistorialPuntos(@PathVariable String id) {
        return ResponseEntity.ok(historialPuntosService.obtenerHistorialUsuario(id));
    }

    @GetMapping("/{id}/boletas")
    public ResponseEntity<?> getBoletasDisponibles(@PathVariable String id) {
        return ResponseEntity.ok(puntosService.obtenerBoletasDisponibles(id));
    }
}