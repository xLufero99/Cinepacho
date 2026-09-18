package co.edu.udistrital.cinepacho.controller;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import co.edu.udistrital.cinepacho.model.local.funciones.Funcion;
import co.edu.udistrital.cinepacho.service.impl.FuncionServiceImpl;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/funciones")
@PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('EMPLEADO')")
@RequiredArgsConstructor
public class AdminFuncionController {

    private final FuncionServiceImpl funcionService;

    @GetMapping
    public ResponseEntity<List<Funcion>> listAll() {
        return ResponseEntity.ok(funcionService.obtenerTodasLasFunciones());
    }

    @GetMapping("/sede/{sedeId}")
    public ResponseEntity<List<Funcion>> listBySede(@PathVariable String sedeId) {
        return ResponseEntity.ok(funcionService.obtenerFuncionesPorSede(sedeId));
    }

    @PostMapping
    public ResponseEntity<Funcion> create(@Valid @RequestBody CrearFuncionDTO dto) {
        Funcion funcion = Funcion.builder()
                .peliculaId(dto.getPeliculaId())
                .sedeId(dto.getSedeId())
                .salaId(dto.getSalaId())
                .fecha(dto.getFecha())
                .hora(String.format("%02d:%02d", dto.getHora().getHour(), dto.getHora().getMinute()))  // Convierte LocalTime a String con formato "HH:MM"
                .formato(dto.getFormato())
                .precioGeneral(dto.getPrecioGeneral())
                .precioPreferencial(dto.getPrecioPreferencial())
                .build();
        Funcion nueva = funcionService.crearFuncion(funcion);
        return ResponseEntity.status(HttpStatus.CREATED).body(nueva);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Funcion> update(@PathVariable String id, @Valid @RequestBody ActualizarFuncionDTO dto) {
        Funcion funcion = Funcion.builder()
                .id(id)
                .peliculaId(dto.getPeliculaId())
                .sedeId(dto.getSedeId())   // no debería cambiar, pero se valida en servicio
                .salaId(dto.getSalaId())
                .fecha(dto.getFecha())
                .hora(dto.getHora().toString())  // Convierte LocalTime a String con formato "HH:MM:SS"
                .formato(dto.getFormato())
                .precioGeneral(dto.getPrecioGeneral())
                .precioPreferencial(dto.getPrecioPreferencial())
                .build();
        return ResponseEntity.ok(funcionService.actualizarFuncion(id, funcion));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        funcionService.eliminarFuncion(id);
        return ResponseEntity.noContent().build();
    }
}

// DTOs anidados (puedes moverlos a archivos separados si prefieres)
@Data
class CrearFuncionDTO {
    @NotBlank private String peliculaId;
    @NotBlank private String sedeId;
    @NotBlank private String salaId;
    @NotNull private LocalDate fecha;
    @NotNull private LocalTime hora;
    private String formato; // opcional, por defecto "2D"
    @Positive private double precioGeneral;
    @Positive private double precioPreferencial;
}

@Data
class ActualizarFuncionDTO {
    @NotBlank private String peliculaId;
    @NotBlank private String sedeId;
    @NotBlank private String salaId;
    @NotNull private LocalDate fecha;
    @NotNull private LocalTime hora;
    private String formato;
    @Positive private double precioGeneral;
    @Positive private double precioPreferencial;
}